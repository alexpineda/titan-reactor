import sceneStore from "@stores/scene-store";
import settingsStore from "@stores/settings-store";
import { createAssets } from "@image/assets";
import * as log from "@ipc/log";
import { preloadIntro } from "../home/space-scene";
import { root } from "@render/root";
import { PreHomeScene } from "./pre-home-scene";
import { waitForSeconds, waitForTruthy } from "@utils/wait-for";
import Janitor from "@utils/janitor";
import path from "path";
import { Filter } from "@audio";
import { SceneState } from "../scene";
import gameStore from "@stores/game-store";
import { mixer } from "@core/global";

let _lastErrorMessage = "";

const makeErrorScene = (errors: string[]) => {
  if (errors.length) {
    const message = errors.join(", ");
    if (message !== _lastErrorMessage) {
      log.error(message);
      sceneStore().setError(new Error(message));
      _lastErrorMessage = message;
    }
  } else {
    sceneStore().clearError();
  }
};

export async function preHomeSceneLoader(): Promise<SceneState> {
  root.render(<PreHomeScene />);

  const janitor = new Janitor();

  const settings = await settingsStore().load();

  await waitForTruthy(() => {
    makeErrorScene(settingsStore().errors);
    return settingsStore().errors.length === 0;
  });

  gameStore().setAssets(await createAssets(settings.data));

  await preloadIntro();

  mixer.setVolumes(settings.data.audio);

  const dropYourSocks = mixer.context.createBufferSource();
  dropYourSocks.buffer = await mixer.loadAudioBuffer(
    path.join(__static, "drop-your-socks.mp3")
  );

  janitor.mop(
    mixer.connect(
      dropYourSocks,
      new Filter(mixer, "bandpass", 50).node,
      mixer.intro
    )
  );

  dropYourSocks.onended = () => janitor.dispose();

  return {
    id: "@loading",
    start: async () => {
      dropYourSocks.detune.setValueAtTime(-200, mixer.context.currentTime + 5);
      dropYourSocks.start();
      await waitForSeconds(1);
    },
    dispose: () => {},
  };
}
