import { ipcRenderer } from "electron";
import { EventDispatcher, WebGLRenderer } from "three";
import { SETTINGS_CHANGED } from "../common/handleNames";
import { getSettings, log, setWebGLCapabilities } from "./invoke";

export class Context extends EventDispatcher {
  constructor(window) {
    super();
    this.window = window;
    this.document = window.document;
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

  // getGameCanvas() {
  //   if (this.gameCanvas) return this.gameCanvas;

  //   const canvas = this.document.createElement("canvas");
  //   canvas.id = "three-canvas";
  //   canvas.style.position = "absolute";
  //   canvas.style.top = "0";
  //   canvas.style.left = "0";
  //   canvas.style.right = "0";
  //   canvas.style.bottom = "0";
  //   canvas.style.zIndex = "-10";
  //   this.gameCanvas = canvas;
  //   return canvas;
  // }

  // getGameAspectRatio() {
  //   const aspect = this.getGameCanvas().width / this.getGameCanvas().height;
  //   console.log("aspect", aspect);
  //   return aspect;
  // }

  // getMinimapCanvas() {
  //   if (this.minimapCanvas) return this.minimapCanvas;

  //   const canvas = this.document.createElement("canvas");
  //   canvas.id = "minimap";
  //   canvas.style.width = "30vh";
  //   canvas.style.height = "30vh";
  //   this.minimapCanvas = canvas;
  //   return canvas;
  // }

  // getMinimapAspectRatio() {
  //   return this.getMinimapCanvas().width / this.getMinimapCanvas().height;
  // }

  // getUnitInformationCanvas() {
  //   if (this.unitInfoCanvas) return this.unitInfoCanvas;

  //   const canvas = this.document.createElement("canvas");
  //   canvas.id = "unit-info";
  //   canvas.style.width = "30vh";
  //   canvas.style.height = "30vh";
  //   this.unitInfoCanvas = canvas;
  //   return canvas;
  // }

  getDevicePixelRatio() {
    return this.window.devicePixelRatio;
  }

  dispose() {
    ipcRenderer.removeListener(SETTINGS_CHANGED, this.settingsChangedListener);

    // this.getGameCanvas().removeEventListener(
    //   "webglcontextrestored",
    //   this._contextRestoredHandler
    // );

    // this.getGameCanvas().removeEventListener(
    //   "webglcontextlost",
    //   this._contextLostHandler
    // );
  }
}
