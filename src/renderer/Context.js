import { ipcRenderer } from "electron";
import {
  BasicShadowMap,
  CineonToneMapping,
  EventDispatcher,
  PCFShadowMap,
  PCFSoftShadowMap,
  sRGBEncoding,
  WebGLRenderer,
} from "three";
import { SETTINGS_CHANGED } from "../common/handleNames";
import { getSettings, log, setWebGLCapabilities } from "./invoke";

export class Context extends EventDispatcher {
  constructor(window) {
    super();
    this.window = window;
    this.document = window.document;
    this.renderer = null;
  }

  async loadSettings() {
    const renderer = new WebGLRenderer();
    this.webGLCapabilities = renderer.capabilities;
    renderer.dispose();

    await setWebGLCapabilities({
      anisotropy: this.webGLCapabilities.getMaxAnisotropy(),
    });

    const settings = await getSettings();
    this.settings = settings;
    this.lang = await import(`common/lang/${settings.language}`);
    console.log("settings", settings);

    this.settingsChangedListener = async (event, { diff, settings }) => {
      console.log("settingsChangedListener", settings, diff);
      this.settings = settings;
      this.lang = await import(`common/lang/${settings.language}`);
      this.dispatchEvent({
        type: "settings",
        message: { settings, lang: this.lang, diff },
      });
    };
    ipcRenderer.on(SETTINGS_CHANGED, this.settingsChangedListener);
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

  getMinimapCanvas() {
    if (this.minimapCanvas) return this.minimapCanvas;

    const canvas = this.document.createElement("canvas");
    canvas.id = "minimap";
    canvas.style.width = "30vh";
    canvas.style.height = "30vh";
    this.minimapCanvas = canvas;
    return canvas;
  }

  setShadowLevel(shadowLevel) {
    const shadowLevels = [null, BasicShadowMap, PCFShadowMap, PCFSoftShadowMap];
    if (this.settings.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = shadowLevels[shadowLevel];
    } else {
      this.renderer.shadowMap.enabled = false;
    }
  }

  _initRenderer() {
    const [width, height] = this.getSceneDimensions();
    const renderer = new WebGLRenderer({
      canvas: this.getGameCanvas(),
      antialias: this.settings.antialias,
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
    renderer.gammaFactor = this.settings.gamma;
    renderer.xr.enabled = true;
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
    this.setShadowLevel(this.settings.shadows);

    this._contextLostHandler = function (event) {
      event.preventDefault();
      this.dispatchEvent({ type: "lostcontext" });
    }.bind(this);

    this.getGameCanvas().addEventListener(
      "webglcontextlost",
      this._contextLostHandler,
      false
    );

    this._contextRestoredHandler = function (event) {
      this.dispatchEvent({ type: "restorecontext" });
    }.bind(this);

    this.getGameCanvas().addEventListener(
      "webglcontextrestored",
      this._contextRestoredHandler,
      false
    );

    this._resizeHandler = this._resize.bind(this);
    this.window.addEventListener("resize", this._resizeHandler, false);
  }

  forceResize() {
    this._resize();
  }

  _resize() {
    const [width, height] = this.getSceneDimensions();
    this.renderer.setSize(width, height);
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
    this.renderer.dispose();
    this.window.removeEventListener("resize", this._resizeHandler);
    this.getGameCanvas().removeEventListener(
      "webglcontextrestored",
      this._contextRestoredHandler
    );

    this.getGameCanvas().removeEventListener(
      "webglcontextlost",
      this._contextLostHandler
    );

    ipcRenderer.removeListener(SETTINGS_CHANGED, this.settingsChangedListener);
  }
}
