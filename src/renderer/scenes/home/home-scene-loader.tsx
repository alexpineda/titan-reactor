import { SceneState } from "../scene";
import { Home } from "./home-scene";
import { createWraithScene, getSurface } from "./space-scene";
import { Janitor } from "three-janitor";
import { renderAppUI } from "../app";

export async function homeSceneLoader(): Promise<SceneState> {
    const janitor = new Janitor( "home-scene-loader" );

    const wraithScene = janitor.mop( await createWraithScene() );
    setTimeout( () => wraithScene.resize(), 500 );


    return {
        id: "@home",
        start: ( ) => {
            renderAppUI(
                {
                    key: "@home",
                    scene: <Home />,
                    surface: getSurface().canvas,
                });
        },
        dispose: ( ) => {
        },
        beforeNext(  ) {
            janitor.dispose();
        },
    };
}
