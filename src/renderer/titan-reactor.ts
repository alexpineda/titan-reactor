import "./reset.css";
import "../../bundled/assets/open-props.1.4.min.css";
import sceneStore from "./stores/scene-store";
import { logCapabilities } from "@utils/renderer-utils";
import { lockdown_ } from "@utils/ses-util";
import "./scenes/home/home-scene";
import { preHomeSceneLoader } from "./scenes/pre-home-scene/pre-home-scene-loader";
import { homeSceneLoader } from "./scenes/home/home-scene-loader";
import { globalEvents } from "@render/global-events";
import { openUrl } from "@ipc/dialogs";
import { mapSceneLoader } from "./scenes/map-scene-loader";
import { replaySceneLoader } from "./scenes/replay-scene-loader";
import { interstitialSceneLoader } from "./scenes/interstitial-scene/interstitial-scene-loader";
import { createIScriptahScene } from "./scenes/iscriptah/iscriptah";
import { useSettingsStore } from "@stores/settings-store";
import { mixer } from "@audio/main-mixer";
import * as log from "@ipc/log";

globalEvents.on("command-center-save-settings", payload => {
  useSettingsStore.setState(payload);
  mixer.setVolumes(payload.data.audio);
});

// deprecate?
globalEvents.on("unsafe-open-url", payload => {
  openUrl(payload);
});

globalEvents.on("load-home-scene", () => sceneStore().execSceneLoader(() => homeSceneLoader()));

globalEvents.on("log-message", ({ message, level, server }) => server ? log.log(message, level) : log.logClient(message, level));

globalEvents.on("load-map-file", async (map) => {
  await sceneStore().execSceneLoader(interstitialSceneLoader);
  sceneStore().execSceneLoader(() => mapSceneLoader(map), interstitialSceneLoader);
});

globalEvents.on("load-replay-file", async (replay: string) => {
  await sceneStore().execSceneLoader(interstitialSceneLoader);
  sceneStore().execSceneLoader(() => replaySceneLoader(replay), interstitialSceneLoader);
});

globalEvents.on("load-iscriptah", async () => sceneStore().execSceneLoader(() => createIScriptahScene()));

logCapabilities();
lockdown_();

(async function bootup() {

  await sceneStore().execSceneLoader(preHomeSceneLoader);

  sceneStore().execSceneLoader(homeSceneLoader);

})()