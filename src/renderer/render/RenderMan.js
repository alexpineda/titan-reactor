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

const log = () => {};
class RenderMan {
  constructor(context) {
    this.context = context;
    this.renderer = null;

    this.bokehOptions = {
      aperture: 15,
      focus: 20,
      maxblur: 1,
    };

    // const gui = new GUI();
    // gui.add( effectController, "focus", 10.0, 3000.0, 10 ).onChange( matChanger );
    // gui.add( effectController, "aperture", 0, 10, 0.1 ).onChange( matChanger );
    // gui.add( effectController, "maxblur", 0.0, 0.01, 0.001 ).onChange( matChanger );
    // gui.close();
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
  }

  renderSplitScreen(scene, camera, viewport) {
    this.renderer.setScissorTest(true);
    this.renderer.setViewport(viewport);
    this.renderer.setScissor(viewport);
    this.render(scene, camera);
    this.renderer.setScissorTest(false);
  }

  _initPostProcessing(scene, camera) {
    this._renderPass = new RenderPass(scene, camera);

    this._bokehPass = new BokehPass(scene, camera, {
      aperture: 15,
      focus: 20,
      maxblur: 1,

      width: this.canvasTarget.width,
      height: this.canvasTarget.height,
    });

    this._composer = new EffectComposer(this.renderer);

    this._composer.addPass(this._renderPass);
    this._composer.addPass(this._bokehPass);

    this._composer.setSize(this.canvasTarget.width, this.canvasTarget.height);
  }

  _render(scene, camera) {
    if (camera.renderCinematic) {
      if (!this._composer) {
        this._initPostProcessing(scene, camera);
      }
      this._bokehPass.uniforms["focus"].value = this.bokehOptions.focus;
      this._bokehPass.uniforms["aperture"].value =
        this.bokehOptions.aperture * 0.00001;
      this._bokehPass.uniforms["maxblur"].value = this.bokehOptions.maxblur;
      this._composer.render(0.1);
    } else {
      this.renderer.render(scene, camera);
    }
    this.canvasTarget.canvas
      .getContext("2d")
      .drawImage(this.renderer.domElement, 0, 0);
  }

  render(scene, camera) {
    this._render(scene, camera);
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
