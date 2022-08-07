import { SceneState } from "common/types";
import { Home } from "./home-scene";
import { createWraithScene, getSurface } from "./wraith-scene";
import { root } from "@render";

export async function homeSceneLoader(): Promise<SceneState> {
  const wraithScene = await createWraithScene();
  root.render(<Home surface={getSurface().canvas} />);

  return {
    id: "@home",
    start: () => {
      wraithScene.start();
    },
    dispose: () => {
      wraithScene.dispose();
    },
  };
}
