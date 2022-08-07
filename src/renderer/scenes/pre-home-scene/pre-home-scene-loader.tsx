import sceneStore from "@stores/scene-store";
import { SceneState, SettingsMeta } from "common/types";
import settingsStore from "@stores/settings-store";
import * as pluginSystem from "@plugins";
import { initializePluginSystem } from "@plugins";
import processStore, { Process } from "@stores/process-store";
import loadAndParseAssets from "@image/load-and-parse-assets";
import * as log from "@ipc/log";
import { preloadIntro } from "../home/wraith-scene";
import { root } from "@render/root";
import { PreHomeScene } from "./pre-home-scene";
import { waitForSeconds } from "@utils/wait-for-process";
import Janitor from "@utils/janitor";
import path from "path";
import { Filter, mixer } from "@audio";

const tryLoad = async (settings: SettingsMeta) => {
  sceneStore().clearError();

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

export async function preHomeSceneLoader(): Promise<SceneState> {
  log.info("@init: loading settings");
  root.render(<PreHomeScene />);

  const janitor = new Janitor();
  const settings = await settingsStore().load();
  await initializePluginSystem(settingsStore().enabledPlugins);
  document.body.addEventListener("mouseup", (evt) => pluginSystem.onClick(evt));

  await tryLoad(settings);
  await preloadIntro();

  const dropYourSocks = await mixer.loadAudioFile(
    path.join(__static, "drop-your-socks.mp3")
  );
  const filter = new Filter();
  filter.node.type = "bandpass";
  filter.changeFrequency(50);

  const gain = mixer.context.createGain();
  filter.node.connect(gain);
  gain.connect(mixer.sound);
  gain.gain.value = 0.6;

  //todo: subscribe to settings changes in order to resolve initial settings issues for users
  return {
    id: "@loading",
    start: async () => {
      dropYourSocks.detune.setValueAtTime(-200, mixer.context.currentTime + 5);
      dropYourSocks.connect(filter.node);
      settings.data.game.playIntroSounds && dropYourSocks.start();
      await waitForSeconds(3);
      setTimeout(() => {
        gain.disconnect();
      }, 20000);
    },
    dispose: () => {
      janitor.mopUp();
    },
  };
}
