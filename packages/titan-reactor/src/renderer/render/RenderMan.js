import {
  WebGLRenderer,
  CineonToneMapping,
  sRGBEncoding,
  BasicShadowMap,
  PCFShadowMap,
  PCFSoftShadowMap,
  Vector4,
  HalfFloatType,
  Vector2,
} from "three";
// import { log } from "../invoke";

import {
  EffectComposer,
  EffectPass,
  RenderPass,
  ClearPass,
  DepthEffect,
  DepthOfFieldEffect,
  SMAAImageLoader,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
  ToneMappingEffect,
  OverrideMaterialManager,
} from "postprocessing";

import FogOfWarEffect from "./effects/FogOfWarEffect";

//https://github.com/vanruesc/postprocessing/wiki/Skinned-and-Instanced-Meshes
OverrideMaterialManager.workaroundEnabled = true;

// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
// import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
// import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";

const log = () => {};

class RenderMan {
  constructor(settings, isDev) {
    this.settings = settings;
    this.isDev = isDev;
    this.renderer = null;
  }

  setShadowLevel(shadowLevel) {
    const shadowLevels = [null, BasicShadowMap, PCFShadowMap, PCFSoftShadowMap];
    if (shadowLevel) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = shadowLevels[shadowLevel];
    } else {
      this.renderer.shadowMap.enabled = false;
    }
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

    window.dofPass = this._dofEffect = new DepthOfFieldEffect(camera, {
      focusDistance: 0.05,
      focalLength: 0.5,
      bokehScale: 4.0,
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

    this._smaaEffect = new SMAAEffect(
      this._smaaSearchImage,
      this._smaaAreaImage,
      SMAAPreset.LOW,
      EdgeDetectionMode.DEPTH
    );

    this.fogOfWarEffect = new FogOfWarEffect();

    const toneMapping = new ToneMappingEffect();
    toneMapping.adaptive = true;

    window.focusFn = (y) => Math.max(y * 0.015, 0.1);

    this._fogPass = new EffectPass(camera, this.fogOfWarEffect);

    this._cinematicPass = new EffectPass(
      camera,
      this.fogOfWarEffect,
      // this._dofEffect,
      this._smaaEffect,
      toneMapping
    );

    this._passes = [this._renderPass, this._fogPass, this._cinematicPass];
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

  enableRenderPass() {
    this._togglePasses(this._renderPass);
  }

  enableCinematicPass() {
    this._togglePasses(this._renderPass, this._cinematicPass);
  }

  enableRenderFogPass() {
    this._togglePasses(this._renderPass, this._fogPass);
  }

  _render(scene, camera, delta) {
    //@todo change this to delta
    this._dofEffect.circleOfConfusionMaterial.uniforms.focalLength.value = window.focusFn(
      camera.position.y
    );
    this._renderPass.scene = scene;
    this._renderPass.camera = camera;
    // this.renderer.render(scene, camera);
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

    // renderer.debug.checkShaderErrors = this.isDev;

    return renderer;
  }

  async initRenderer(camera) {
    log("initializing renderer");
    if (this.renderer) {
      throw new Error("renderer already initialized");
    }

    this.renderer = this._initRenderer();
    this.setShadowLevel(this.settings.shadows);

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
