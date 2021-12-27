// @ts-nocheck

import { easePoly } from "d3-ease";
import {
  BloomEffect,
  DepthOfFieldEffect,
  EdgeDetectionMode,
  EffectComposer,
  EffectPass,
  OverrideMaterialManager,
  RenderPass,
  SMAAEffect,
  SMAAImageLoader,
  SMAAPreset,
  ToneMappingEffect,
}
  from "postprocessing";

import {
  Camera,
  HalfFloatType,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  Vector4,
  WebGLRenderer,
} from "three";

import { CanvasTarget } from "../../common/image";
import { EmptyFunc, Settings } from "../../common/types";
import FogOfWarEffect from "../fogofwar/fog-of-war-effect";
import * as log from "../ipc/log"

//https://github.com/vanruesc/postprocessing/wiki/Skinned-and-Instanced-Meshes
OverrideMaterialManager.workaroundEnabled = true;

type DepthOfFieldEffect = typeof DepthOfFieldEffect;
type RenderPass = typeof RenderPass;
type EffectComposer = typeof EffectComposer;
type SMAAEffect = typeof SMAAEffect;
type EffectPass = typeof EffectPass;
type ToneMappingEffect = typeof ToneMappingEffect;
type BloomEffect = typeof BloomEffect;

export class Renderer {
  settings: Settings;
  renderer?: WebGLRenderer;
  _dofEffect: DepthOfFieldEffect;
  _renderPass: RenderPass;
  _composer: EffectComposer;
  canvasTarget?: CanvasTarget;
  _smaaSearchImage: any;
  _smaaAreaImage: any;
  _smaaEffect: SMAAEffect;
  fogOfWarEffect?: FogOfWarEffect;
  toneMappingEffect: ToneMappingEffect;
  _fogPass = EffectPass;
  _bloomEffect: BloomEffect;
  _bloomPass = EffectPass;
  _cinematicPass: EffectPass;
  _cinematicPassWithAA: EffectPass;
  _smaaPass: EffectPass;
  _passes?: [
    RenderPass,
    EffectPass,
    EffectPass,
    EffectPass,
    EffectPass,
    EffectPass
  ];

  _contextLostListener?: () => void;
  _contextRestoredListener?: () => void;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  setShadowLevel() {
    if (!this.renderer) return;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
  }

  setSize(width: number, height: number) {
    this._composer.setSize(width, height, false);
  }

  setCanvasTarget(canvasTarget: CanvasTarget) {
    if (!this.renderer) return;
    this.canvasTarget = canvasTarget;
    this.renderer.setViewport(
      new Vector4(0, 0, canvasTarget.width, canvasTarget.height)
    );
  }

  renderSplitScreen(
    scene: Scene,
    camera: PerspectiveCamera,
    viewport: Vector4
  ) {
    if (!this.renderer) return;
    this.renderer.setScissorTest(true);
    this.renderer.setViewport(viewport);
    this.renderer.setScissor(viewport);
    this.render(scene, camera);
    this.renderer.setScissorTest(false);
  }

  async _initPostProcessing(camera: Camera) {
    this._composer = new EffectComposer(this.renderer, {
      frameBufferType: HalfFloatType,
    });
    this._composer.autoRenderToScreen = false;
    this._renderPass = new RenderPass(camera);

    // @ts-ignore
    window.dofEffect = this._dofEffect = new DepthOfFieldEffect(camera, {
      focusDistance: 0.01,
      focalLength: 0.01,
      bokehScale: 1.0,
      height: 480,
    });

    if (!this._smaaSearchImage) {
      await new Promise((res: EmptyFunc) => {
        new SMAAImageLoader().load(
          ([searchImage, areaImage]: [searchImage: any, areaImage: any]) => {
            this._smaaSearchImage = searchImage;
            this._smaaAreaImage = areaImage;
            res();
          }
        );
      });
    }

    // @ts-ignore
    window.smaaEffect = this._smaaEffect = new SMAAEffect(
      this._smaaSearchImage,
      this._smaaAreaImage,
      SMAAPreset.LOW,
      EdgeDetectionMode.DEPTH
    );

    this.fogOfWarEffect = new FogOfWarEffect();

    const toneMapping = new ToneMappingEffect();

    // @ts-ignore
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

  _togglePasses(...passes: EffectPass[]) {
    this._passes?.forEach((p) => {
      p.enabled = false;
      p.renderToScreen = false;
    });

    let lastPass: EffectPass = null;
    passes.forEach((p) => {
      p.enabled = true;
      lastPass = p;
    });
    lastPass.renderToScreen = true;
  }

  enableRenderPass(antialias = this.settings.graphics.antialias) {
    if (antialias) {
      this._togglePasses(this._renderPass, this._smaaPass);
    } else {
      this._togglePasses(this._renderPass);
    }
  }

  enableCinematicPass(antialias = this.settings.graphics.antialias) {
    this._togglePasses(
      this._renderPass,
      this._bloomPass,
      antialias ? this._cinematicPassWithAA : this._cinematicPass
    );
  }

  enableRenderFogPass() {
    this._togglePasses(this._renderPass, this._fogPass);
  }

  updateFocus(camera: PerspectiveCamera) {
    const cy = (Math.max(20, Math.min(90, camera.position.y)) - 20) / 70;

    const cz = 1 - (Math.max(22, Math.min(55, camera.fov)) - 22) / 33;
    const min = cz * 0.2 + 0.1;

    const ey = easePoly(cy);
    const pa = 1 - Math.max(0.2, Math.min(1, 0)); // cameras.control.polarAngle));
    const cx = ey * pa;
    const o = cx * (1 - min) + min;

    this._dofEffect.circleOfConfusionMaterial.uniforms.focalLength.value = o;
  }

  _render(scene: Scene, camera: PerspectiveCamera, delta: number) {
    if (!this.renderer || !this.canvasTarget) return;
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

  render(scene: Scene, camera: PerspectiveCamera, delta = 0.1) {
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

    renderer.debug.checkShaderErrors = false;

    return renderer;
  }

  async init(camera: Camera) {
    log.info("initializing renderer");
    if (this.renderer) {
      this.dispose();
    }

    this.renderer = this._initRenderer();
    this.setShadowLevel();

    await this._initPostProcessing(camera);

    this._contextLostListener = () => { };
    this._contextRestoredListener = () => {
      this.dispose();
      this.init(camera);
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
    this.renderer?.setAnimationLoop(null);

    // @ts-ignore
    // typescript does not recognize webglcontext events
    (this.renderer.domElement as HTMLCanvasElement).removeEventListener(
      "webglcontextlost",
      this._contextLostListener
    );
    // @ts-ignore
    (this.renderer.domElement as HTMLCanvasElement).removeEventListener(
      "webglcontextrestored",
      this._contextRestoredListener
    );

    //bug in cinematic pass dispose requires us to set camera to null before disposing
    this._dofEffect.camera = null;
    this._cinematicPass.dispose();
    this.renderer?.dispose();
    this.renderer = undefined;
  }
}

export default Renderer;
