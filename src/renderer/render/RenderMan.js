import {
  WebGLRenderer,
  CineonToneMapping,
  sRGBEncoding,
  BasicShadowMap,
  PCFShadowMap,
  PCFSoftShadowMap,
  Vector4,
} from "three";
// import { log } from "../invoke";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";

const log = () => {};
class RenderMan {
  constructor(context) {
    this.context = context;
    this.renderer = null;

    this.bokehOptions = { aperture: 40, focus: 40, maxblur: 1 };

    this.filmOptions = {
      noiseIntensity: 0.5,
      scanlinesIntensity: 0.5,
      scanlinesCount: 100,
      grayscale: 0,
    };
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
    this.renderer.setSize(canvasTarget.width, canvasTarget.height, false);
    this.renderer.setViewport(
      new Vector4(0, 0, canvasTarget.width, canvasTarget.height)
    );
    this._composer.setSize(this.canvasTarget.width, this.canvasTarget.height);
    this._composer.setPixelRatio(canvasTarget.pixelRatio);
  }

  renderSplitScreen(scene, camera, viewport) {
    this.renderer.setScissorTest(true);
    this.renderer.setViewport(viewport);
    this.renderer.setScissor(viewport);
    this.render(scene, camera);
    this.renderer.setScissorTest(false);
  }

  _initPostProcessing(scene, camera) {
    this._postprocessingInitialized = true;
    this._renderPass = new RenderPass(scene, camera);

    this._bokehPass = new BokehPass(scene, camera, {
      aperture: 40,
      focus: 40,
      maxblur: 1,

      width: this.canvasTarget.width,
      height: this.canvasTarget.height,
    });

    this._filmPass = new FilmPass();

    this._composer.addPass(this._renderPass);
    this._composer.addPass(this._bokehPass);
    // this._composer.addPass(this._filmPass);
  }

  _render(scene, camera, isCinematic = false) {
    if (isCinematic) {
      if (!this._postprocessingInitialized) {
        this._initPostProcessing(scene, camera);
      }
      this._bokehPass.uniforms["focus"].value = this.bokehOptions.focus;
      this._bokehPass.uniforms["aperture"].value =
        this.bokehOptions.aperture * 0.00001;
      this._bokehPass.uniforms["maxblur"].value = this.bokehOptions.maxblur;

      this._filmPass.uniforms["grayscale"].value = this.filmOptions.grayscale;
      this._filmPass.uniforms[
        "nIntensity"
      ].value = this.filmOptions.noiseIntensity;
      this._filmPass.uniforms[
        "sIntensity"
      ].value = this.filmOptions.scanlinesIntensity;
      this._filmPass.uniforms["sCount"].value = this.filmOptions.scanlinesCount;
      this._composer.render(0.1);
    } else {
      this.renderer.render(scene, camera);
    }
    this.canvasTarget.canvas
      .getContext("2d")
      .drawImage(this.renderer.domElement, 0, 0);
  }

  render(scene, camera, isCinematic) {
    this._render(scene, camera, isCinematic);
  }

  _initRenderer() {
    const renderer = new WebGLRenderer({
      antialias: this.context.settings.antialias,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
      logarithmicDepthBuffer: false,
    });
    renderer.autoClear = false;
    renderer.toneMapping = CineonToneMapping;
    renderer.toneMappingExposure = this.context.settings.gamma;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;

    renderer.debug.checkShaderErrors = this.context.settings.isDev;

    return renderer;
  }

  initRenderer(force = false) {
    if (this.renderer && !force) return;

    log(`initializing renderer ${force ? "(forced)" : ""}`);

    if (this.renderer && force) {
      try {
        this.renderer.dispose();
      } catch (err) {
        log("failed to dispose renderer");
      }
    }

    this.renderer = this._initRenderer();
    this.setShadowLevel(this.context.settings.shadows);

    this._composer = new EffectComposer(this.renderer);

    this._contextLostListener = () => {};
    this._contextRestoredListener = () => {
      this.initRenderer(true);
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

    this.renderer.dispose();
  }
}

export default RenderMan;
