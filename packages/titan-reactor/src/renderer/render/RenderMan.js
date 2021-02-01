import {
  WebGLRenderer,
  CineonToneMapping,
  sRGBEncoding,
  BasicShadowMap,
  PCFShadowMap,
  PCFSoftShadowMap,
  Vector4,
  HalfFloatType,
} from "three";
// import { log } from "../invoke";

import {
  EffectComposer,
  EffectPass,
  RenderPass,
  ClearPass,
  DepthOfFieldEffect,
  SMAAImageLoader,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
  ToneMappingEffect,
} from "postprocessing";

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

  setCanvasTarget(canvasTarget) {
    this.canvasTarget = canvasTarget;
    this.renderer.setPixelRatio(canvasTarget.pixelRatio);
    this.renderer.setViewport(
      new Vector4(0, 0, canvasTarget.width, canvasTarget.height)
    );
    this._composer.setSize(
      this.canvasTarget.width,
      this.canvasTarget.height,
      false
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

    window.focusFn = (y) => Math.max(y * 0.015, 0.1);
    this._cinematicPass = new EffectPass(
      camera,
      this._dofEffect,
      // this._smaaEffect,
      new ToneMappingEffect()
    );

    this._composer.addPass(new ClearPass());
    this._composer.addPass(this._renderPass);
    this._composer.addPass(this._cinematicPass);
    // this._composer.addPass(this._smaaEffect);
    // this._composer.addPass(this._filmPass);
    this.allEnabledPasses();
  }

  onlyRenderPass() {
    this._cinematicPass.enabled = false;
    this._cinematicPass.renderToScreen = false;
    this._renderPass.renderToScreen = true;
  }

  allEnabledPasses() {
    this._cinematicPass.enabled = true;
    this._cinematicPass.renderToScreen = true;
    this._renderPass.renderToScreen = false;
  }

  _render(scene, camera) {
    //@todo change this to delta
    this._dofEffect.circleOfConfusionMaterial.uniforms.focalLength.value = window.focusFn(
      camera.position.y
    );
    this._renderPass.scene = scene;
    this._renderPass.camera = camera;
    this._composer.render(0.1);

    this.canvasTarget.canvas
      .getContext("2d")
      .drawImage(this.renderer.domElement, 0, 0);
  }

  render(scene, camera) {
    this._render(scene, camera);
  }

  _initRenderer() {
    const renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
      logarithmicDepthBuffer: false,
      antialias: false,
      stencil: false,
      depth: true,
    });

    renderer.autoClear = false;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;
    renderer.dithering = false;

    renderer.debug.checkShaderErrors = this.isDev;

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

    this._cinematicPass.dispose();
    this.renderer.dispose();
    this.renderer = null;
  }
}

export default RenderMan;
