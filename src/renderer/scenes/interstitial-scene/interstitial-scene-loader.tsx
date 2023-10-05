import { SceneState } from "../scene";
import { InterstitialScene } from "./interstitial-scene";
import { getSurface } from "../home/space-scene";
import { root } from "@render/root";
import { waitForSeconds } from "@utils/wait-for";

export async function interstitialSceneLoader(): Promise<SceneState> {
    
    await waitForSeconds( 0 );

    return {
        id: "@interstitial",
        start: () => {
            getSurface().canvas.classList.add( "hue" );
            root.render( <InterstitialScene surface={getSurface().canvas} /> );        
        },
        dispose: () => {},
        beforeNext: () => {
            root.render( null );
            getSurface().canvas.classList.remove( "hue" );
        },
    };
}
