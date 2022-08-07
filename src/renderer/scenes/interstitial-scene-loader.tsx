import { SceneState } from "common/types";
import { SceneLoading } from "../home/scene-loading";
import { getSurface } from "../home/wraith-scene";
import { root } from "../render/root";

export async function interstitialSceneLoader(): Promise<SceneState> {
  root.render(<SceneLoading surface={getSurface().canvas} />);
  return {
    id: "@interstitial",
    start: () => {},
    dispose: () => {},
    beforeNext: () => {
      root.render(null);
    },
  };
}
