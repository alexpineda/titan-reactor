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

  getDevicePixelRatio() {
    return this.window.devicePixelRatio;
  }

  dispose() {
    ipcRenderer.removeListener(SETTINGS_CHANGED, this.settingsChangedListener);
  }
}
