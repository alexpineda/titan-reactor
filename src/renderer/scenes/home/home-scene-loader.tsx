import { SceneState, SceneStateID } from "../scene";
import { Home } from "./home-scene";
import { createWraithScene, getSurface } from "./space-scene";
import { renderComposer, root } from "@render";
import { mixer } from "@audio/main-mixer";
import { waitForSeconds } from "@utils/wait-for";
import Janitor from "@utils/janitor";

export async function homeSceneLoader(): Promise<SceneState> {
  const janitor = new Janitor();
  janitor.mop(await createWraithScene());

  await waitForSeconds(1);
  root.render(<Home surface={getSurface().canvas} />);

  const swoosh = mixer.context.createBufferSource();
  swoosh.buffer = await mixer.loadAudioBuffer(
    "casc:Interstitials\\sounds\\scHD_Interstitials_Terran_TR3010.wav"
  );
  janitor.mop(mixer.connect(swoosh, mixer.createGain(0.1), mixer.intro));

  return {
    id: "@home",
    beforeNext() {
      renderComposer.getWebGLRenderer().physicallyCorrectLights = true;
    },
    start: (prevID?: SceneStateID) => {
      renderComposer.getWebGLRenderer().physicallyCorrectLights = false;
      if (prevID !== "@loading") {
        swoosh.start();
      }
    },
    dispose: () => {
      janitor.dispose();
    },
  };
}
