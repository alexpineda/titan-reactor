import {
  CineonToneMapping,
  EventDispatcher,
  PCFSoftShadowMap,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import { GameOptions } from "./replay/GameOptions";

export class Context extends EventDispatcher {
  constructor(window) {
    super();
    this.window = window;
    this.document = window.document;
    this.renderer = null;
    this.cachePath = "";
    this.bwDataPath = "";
    this.options = new GameOptions(this);
  }

  async loadSettings() {
    this.cachePath = "~/dev/cache/MapData";
    this.bwDataPath = "./bwdata";
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

  _initRenderer() {
    const [width, height] = this.getSceneDimensions();
    const renderer = new WebGLRenderer({
      canvas: this.getGameCanvas(),
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
      logarithmicDepthBuffer: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(this.window.devicePixelRatio);
    renderer.autoClear = false;
    renderer.toneMapping = CineonToneMapping; //THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.xr.enabled = true;
    return renderer;
  }

  initRenderer(force = false) {
    if (this.renderer && !force) return;

    this.renderer = this._initRenderer();

    this.getGameCanvas().addEventListener(
      "webglcontextlost",
      function (event) {
        event.preventDefault();
        // animationID would have been set by your call to requestAnimationFrame
        this.dispatchEvent({ type: "lostcontext" });
      },
      false
    );

    this.getGameCanvas().addEventListener(
      "webglcontextrestored",
      function (event) {
        this.dispatchEvent({ type: "restorecontext" });
      },
      false
    );

    this.window.addEventListener("resize", this._resize.bind(this), false);
  }

  forceResize() {
    this._resize();
  }

  _resize() {
    this.renderer.setSize(this.window.innerWidth, this.window.innerHeight);
    this.dispatchEvent({ type: "resize", message: this.getSceneDimensions() });
  }

  getSceneDimensions() {
    return [this.window.innerWidth, this.window.innerHeight];
  }

  getAspectRatio() {
    const [width, height] = this.getSceneDimensions();
    return width / height;
  }

  dispose() {
    this.window.removeEventListener("resize", this._resize);
  }
}
