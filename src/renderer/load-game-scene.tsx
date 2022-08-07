import { SceneState } from "common/types";
import { SceneLoading } from "./home/scene-loading";
import { getSurface } from "./home/wraith-scene";
import { root } from "./render/root";

export async function loadGameScene(): Promise<SceneState> {
  root.render(<SceneLoading surface={getSurface().canvas} />);
  return {
    id: "@home",
    start: () => {},
    dispose: () => {},
    beforeNext: () => {
      root.render(null);
    },
  };
}
