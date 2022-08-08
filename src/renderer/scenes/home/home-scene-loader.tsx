import { SceneState, SceneStateID } from "common/types";
import { Home } from "./home-scene";
import { createWraithScene, getSurface } from "./wraith-scene";
import { root } from "@render";
import { mixer } from "@audio/main-mixer";
import { waitForSeconds } from "@utils/wait-for-process";
import Janitor from "@utils/janitor";

export async function homeSceneLoader(): Promise<SceneState> {
  const janitor = new Janitor(await createWraithScene());

  await waitForSeconds(1);
  root.render(<Home surface={getSurface().canvas} />);

  const swoosh = mixer.context.createBufferSource();
  swoosh.buffer = await mixer.loadAudioBuffer(
    "casc:Interstitials\\sounds\\scHD_Interstitials_Terran_TR3010.wav"
  );
  janitor.add(mixer.connect(swoosh, mixer.createGain(0.1), mixer.intro));

  return {
    id: "@home",
    start: (prevID?: SceneStateID) => {
      if (prevID !== "@loading") {
        swoosh.start();
      }
    },
    dispose: () => {
      janitor.mopUp();
    },
  };
}
