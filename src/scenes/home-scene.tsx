import { TRScene, TRSceneID } from "./scene";
import { HomeSceneUI } from "./home/home-scene-ui";
import { createWraithScene, getSurface } from "./home/space-scene";

export class HomeScene implements TRScene {
    id: TRSceneID = "@home";

    async load() {
        const wraithScene = await createWraithScene();
        // setTimeout( () => wraithScene.resize(), 500 );
        return {
            component: <HomeSceneUI />,
            surface: getSurface().canvas,
            dispose: () => wraithScene.dispose()
        }
    }
}
