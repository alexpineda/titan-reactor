import { SceneState, SceneStateID } from "../scene";
import { Home } from "./home-scene";
import { createWraithScene, getSurface } from "./space-scene";
import { Janitor } from "three-janitor";
import { mixer } from "@core/global";
import { root } from "@render/root";

export async function homeSceneLoader(): Promise<SceneState> {
    const janitor = new Janitor( "home-scene-loader" );
    
    const wraithScene = janitor.mop(await createWraithScene());
    setTimeout( () => wraithScene.resize(), 500);

    const swoosh = mixer.context.createBufferSource();
    swoosh.buffer = await mixer.loadAudioBuffer(
        "casc:Interstitials\\sounds\\scHD_Interstitials_Terran_TR3010.wav"
    );
    janitor.mop( mixer.connect( swoosh, mixer.createGain( 0.1 ), mixer.intro ), "swoosh" );

    return {
        id: "@home",
        start: ( prevID?: SceneStateID ) => {
            if ( prevID !== "@loading" ) {
                swoosh.start();
            }
            root.render( <Home surface={getSurface().canvas} /> );
        },
        dispose: (newId) => {
            if (newId !== "@replay" && newId !== "@map") {
                janitor.dispose();
                root.render( null );
            }
        },
        beforeNext(newId) {
            if (newId === "@replay" || newId === "@map") {
                janitor.dispose();
                root.render( null );
            }

        }
    };
}
