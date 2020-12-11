const {
  WebGLRenderer,
  CineonToneMapping,
  sRGBEncoding,
  BasicShadowMap,
  PCFShadowMap,
  PCFSoftShadowMap,
  Vector4,
} = require("three");
import { log } from "../invoke";

class RenderMan {
  constructor(context) {
    this.context = context;
    this.renderer = null;

    this._resizeHandler = () => {
      // this.renderer.setSize();
    };
    this.context.addEventListener("resize", this._resizeHandler);
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

  setCanvas(canvas) {
    this.canvas = canvas;
    this.renderer.setSize(canvas.width, canvas.height);
  }

  renderSplitScreen(scene, camera, viewport) {
    this.renderer.setScissorTest(true);
    this.renderer.setViewport(viewport);
    this.renderer.setScissor(viewport);
    this.render(scene, camera);
    this.renderer.setScissorTest(false);
  }

  _render(scene, camera) {
    this.renderer.render(scene, camera);
    this.canvas.getContext("2d").drawImage(this.renderer.domElement, 0, 0);
  }

  render(
    scene,
    camera,
    viewport = new Vector4(0, 0, this.canvas.width, this.canvas.height)
  ) {
    this.renderer.setViewport(viewport);
    this._render(scene, camera);
  }

  _initRenderer() {
    const renderer = new WebGLRenderer({
      antialias: this.context.settings.antialias,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
      logarithmicDepthBuffer: false,
    });
    renderer.setPixelRatio(this.context.getDevicePixelRatio());
    renderer.autoClear = false;
    renderer.toneMapping = CineonToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;
    renderer.gammaFactor = this.context.settings.gamma;
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
