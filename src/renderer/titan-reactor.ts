import "./reset.css";
import * as log from "./ipc/log";
import screenStore from "./stores/screen-store";
import settingsStore from "./stores/settings-store";
import * as pluginSystem from "./plugins";
import { initializePluginSystem } from "./plugins";
import processStore, { Process } from "@stores/process-store";
import loadAndParseAssets from "./assets/load-and-parse-assets";
import { logCapabilities } from "@utils/renderer-utils";
import { SettingsMeta } from "common/types";
import { lockdown_ } from "@utils/ses-util";
import "./home/home";
import "./home/handle-events";
import { playIntroAudio } from "./home/wraith-scene";
// import "./utils/webgl-lint";

declare global {
  interface Window {
    isGameWindow: boolean;
  }
}
window.isGameWindow = true;

async function bootup() {
  try {
    log.info("@init: loading settings");
    const settings = await settingsStore().load();

    await initializePluginSystem(settingsStore().enabledPlugins);
    document.body.addEventListener("mouseup", (evt) =>
      pluginSystem.onClick(evt)
    );

    await tryLoad(settings);

    playIntroAudio();
    setTimeout(() => screenStore().complete(), 3000);

  } catch (err: any) {
    log.error(err.message);
    screenStore().setError(err);
  }
}

const tryLoad = async (settings: SettingsMeta) => {
  screenStore().clearError();

  if (settings.errors.length) {
    const error = `@init: error with settings - ${settings.errors.join(", ")}`;
    log.error(error);
    throw new Error(error);
  }

  if (
    processStore().isComplete(Process.AtlasPreload) ||
    processStore().isInProgress(Process.AtlasPreload)
  ) {
    return;
  }
  await loadAndParseAssets(settings.data);
};

logCapabilities();
lockdown_();
bootup();
