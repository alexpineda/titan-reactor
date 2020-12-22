import { ipcRenderer } from "electron";
import { EventDispatcher, WebGLRenderer } from "three";
import { SETTINGS_CHANGED } from "../common/handleNames";
import { getSettings, log, setWebGLCapabilities } from "./invoke";

const SUPPORTED_WINDOW_SIZES = [
  { width: 640, height: 480 },
  { width: 800, height: 600 },
  { width: 1024, height: 768 },
  { width: 1152, height: 864 },
  { width: 1280, height: 960 },
  { width: 1400, height: 1050 },
  { width: 1600, height: 1200 },
  { width: 2048, height: 1536 },
  { width: 3200, height: 2400 },
  { width: 4000, height: 3000 },
  { width: 6400, height: 4800 },
];

export class Context extends EventDispatcher {
  constructor(store) {
    super();

    this.store = store;
    const sizes = SUPPORTED_WINDOW_SIZES.filter(
      (r) => r.width <= screen.width && r.height <= screen.height
    );
  }

  async loadSettings() {
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

  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }

  dispose() {
    ipcRenderer.removeListener(SETTINGS_CHANGED, this.settingsChangedListener);
  }
}
