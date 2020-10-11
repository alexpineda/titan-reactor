import {
  CineonToneMapping,
  PCFSoftShadowMap,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import WithListeners from "./utils/WithListeners";

export class SceneContext extends WithListeners {
  constructor(window) {
    super();
    this.document = window.document;
  }

  getGameCanvas() {
    if (this.gameCanvas) return this.gameCanvas;

    const canvas = this.document.createElement("canvas");
    canvas.id = "three-canvas";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.right = "0";
    canvas.style.bottom = "0";
    canvas.style.zIndex = "-10";
    this.gameCanvas = canvas;
    return canvas;
  }

  initRenderer() {
    if (this.renderer) return;

    const [width, height] = this.getSceneDimensions();

    const renderer = new WebGLRenderer({
      canvas: this.getGameCanvas(),
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
      logarithmicDepthBuffer: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;
    renderer.toneMapping = CineonToneMapping; //THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.xr.enabled = true;
    this.renderer = renderer;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
    this._changed();
  }

  getRenderer() {
    return this.renderer;
  }

  setSceneDimension(width, height) {
    this.width = width;
    this.height = height;
  }

  getSceneDimensions() {
    return [this.width, this.height];
  }

  getAspectRatio() {
    return this.width / this.height;
  }
}
