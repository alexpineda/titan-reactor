import { SceneState, SceneStateID } from "../scene";
import { Home } from "./home-scene";
import { createWraithScene, getSurface } from "./space-scene";
import { renderComposer, root } from "@render";
import { waitForSeconds } from "@utils/wait-for";
import Janitor from "@utils/janitor";
import { Borrowed } from "@utils/object-utils";
import { Globals } from "@core/global";

export async function homeSceneLoader(
  globals: Borrowed<Globals>
): Promise<SceneState> {
  const janitor = new Janitor();
  janitor.mop(await createWraithScene(globals));

  await waitForSeconds(1);
  root.render(<Home surface={getSurface().canvas} />);

  const swoosh = globals.mixer!.context.createBufferSource();
  swoosh.buffer = await globals.mixer!.loadAudioBuffer(
    "casc:Interstitials\\sounds\\scHD_Interstitials_Terran_TR3010.wav"
  );
  janitor.mop(
    globals.mixer!.connect(
      swoosh,
      globals.mixer!.createGain(0.1),
      globals.mixer!.intro
    )
  );

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
