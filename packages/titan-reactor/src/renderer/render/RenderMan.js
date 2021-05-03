import {
  WebGLRenderer,
  sRGBEncoding,
  PCFSoftShadowMap,
  Vector4,
  HalfFloatType,
} from "three";
// import { log } from "../invoke";

import {
  EffectComposer,
  EffectPass,
  RenderPass,
  DepthOfFieldEffect,
  SMAAImageLoader,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
  ToneMappingEffect,
  OverrideMaterialManager,
  BloomEffect,
} from "postprocessing";

import FogOfWarEffect from "../game/fogofwar/FogOfWarEffect";
import { easePoly } from "d3-ease";

//https://github.com/vanruesc/postprocessing/wiki/Skinned-and-Instanced-Meshes
OverrideMaterialManager.workaroundEnabled = true;

const log = () => {};

class RenderMan {
  constructor(settings) {
    this.settings = settings;
    this.renderer = null;
  }

  setShadowLevel() {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
  }

  setSize(width, height) {
    this._composer.setSize(width, height, false);
  }

  setCanvasTarget(canvasTarget) {
    this.canvasTarget = canvasTarget;
    this.renderer.setViewport(
      new Vector4(0, 0, canvasTarget.width, canvasTarget.height)
    );
  }

  renderSplitScreen(scene, camera, viewport) {
    this.renderer.setScissorTest(true);
    this.renderer.setViewport(viewport);
    this.renderer.setScissor(viewport);
    this.render(scene, camera);
    this.renderer.setScissorTest(false);
  }

  async _initPostProcessing(camera) {
    this._composer = new EffectComposer(this.renderer, {
      frameBufferType: HalfFloatType,
    });
    this._composer.autoRenderToScreen = false;
    this._renderPass = new RenderPass(camera);

    window.dofEffect = this._dofEffect = new DepthOfFieldEffect(camera, {
      focusDistance: 0.01,
      focalLength: 0.01,
      bokehScale: 1.0,
      height: 480,
    });

    if (!this._smaaSearchImage) {
      await new Promise((res) => {
        new SMAAImageLoader().load(([searchImage, areaImage]) => {
          this._smaaSearchImage = searchImage;
          this._smaaAreaImage = areaImage;
          res();
        });
      });
    }

    window.smaaEffect = this._smaaEffect = new SMAAEffect(
      this._smaaSearchImage,
      this._smaaAreaImage,
      SMAAPreset.LOW,
      EdgeDetectionMode.DEPTH
    );

    this.fogOfWarEffect = new FogOfWarEffect();

    const toneMapping = new ToneMappingEffect();
    window.toneMappingEffect = toneMapping;

    this._fogPass = new EffectPass(camera, this.fogOfWarEffect);

    this._bloomEffect = new BloomEffect({
      luminanceThreshold: 0.9,
    });

    this._bloomPass = new EffectPass(camera, this._bloomEffect);

    this._cinematicPass = new EffectPass(
      camera,
      this._dofEffect,
      this.fogOfWarEffect
    );

    this._cinematicPassWithAA = new EffectPass(
      camera,
      this._dofEffect,
      this.fogOfWarEffect,
      this._smaaEffect
    );

    this._smaaPass = new EffectPass(camera, this._smaaEffect, toneMapping);

    this._passes = [
      this._renderPass,
      this._bloomPass,
      this._fogPass,
      this._cinematicPass,
      this._cinematicPassWithAA,
      this._smaaPass,
    ];
    this._passes.forEach((p) => this._composer.addPass(p));

    this.enableCinematicPass();
  }

  _togglePasses(...passes) {
    this._passes.forEach((p) => {
      p.enabled = false;
      p.renderToScreen = false;
    });

    let lastPass;
    passes.forEach((p) => {
      p.enabled = true;
      lastPass = p;
    });
    lastPass.renderToScreen = true;
  }

  enableRenderPass(antialias = this.settings.antialias) {
    if (antialias) {
      this._togglePasses(this._renderPass, this._smaaPass);
    } else {
      this._togglePasses(this._renderPass);
    }
  }

  enableCinematicPass(antialias = this.settings.antialias) {
    this._togglePasses(
      this._renderPass,
      this._bloomPass,
      antialias ? this._cinematicPassWithAA : this._cinematicPass
    );
  }

  enableRenderFogPass() {
    this._togglePasses(this._renderPass, this._fogPass);
  }

  updateFocus(cameras) {
    const cy =
      (Math.max(20, Math.min(90, cameras.camera.position.y)) - 20) / 70;

    const cz = 1 - (Math.max(22, Math.min(55, cameras.camera.fov)) - 22) / 33;
    const min = cz * 0.2 + 0.1;

    const ey = easePoly(cy);
    const pa = 1 - Math.max(0.2, Math.min(1, cameras.control.polarAngle));
    const cx = ey * pa;
    const o = cx * (1 - min) + min;

    this._dofEffect.circleOfConfusionMaterial.uniforms.focalLength.value = o;
  }

  _render(scene, camera, delta) {
    this._renderPass.scene = scene;
    this._renderPass.camera = camera;

    this._composer.render(delta);

    this.canvasTarget.ctx.drawImage(
      this.renderer.domElement,
      0,
      this.renderer.domElement.height - this.canvasTarget.scaledHeight,
      this.canvasTarget.scaledWidth,
      this.canvasTarget.scaledHeight,
      0,
      0,
      this.canvasTarget.scaledWidth,
      this.canvasTarget.scaledHeight
    );
  }

  render(scene, camera, delta = 0.1) {
    this._render(scene, camera, delta);
  }

  _initRenderer() {
    const renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
      antialias: false,
      stencil: false,
      depth: true,
    });
    renderer.autoClear = false;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;
    renderer.dithering = false;

    renderer.debug.checkShaderErrors = false;

    return renderer;
  }

  async initRenderer(camera) {
    log("initializing renderer");
    if (this.renderer) {
      throw new Error("renderer already initialized");
    }

    this.renderer = this._initRenderer();
    this.setShadowLevel();

    await this._initPostProcessing(camera);

    this._contextLostListener = () => {};
    this._contextRestoredListener = () => {
      this.dispose();
      this.initRenderer(camera);
    };
    this.renderer.domElement.addEventListener(
      "webglcontextlost",
      this._contextLostListener,
      false
    );
    this.renderer.domElement.addEventListener(
      "webglcontextrestored",
      this._contextRestoredListener,
      false
    );
  }

  dispose() {
    this.renderer.domElement.removeEventListener(
      "webglcontextlost",
      this._contextLostListener
    );
    this.renderer.domElement.removeEventListener(
      "webglcontextrestored",
      this._contextRestoredListener
    );

    //bug in cinematic pass dispose requires us to set camera to null before disposing
    this._dofEffect.camera = null;
    this._cinematicPass.dispose();
    this.renderer.dispose();
    this.renderer = null;
  }
}

export default RenderMan;
