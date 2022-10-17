import { SceneState } from "../scene";
import { InterstitialScene } from "./interstitial-scene";
import { getSurface } from "../home/space-scene";
import { root } from "@render/root";

export function interstitialSceneLoader(): SceneState {
    getSurface().canvas.classList.add( "hue" );
    root.render( <InterstitialScene surface={getSurface().canvas} /> );
    return {
        id: "@interstitial",
        start: () => {},
        dispose: () => {},
        beforeNext: () => {
            root.render( null );
            getSurface().canvas.classList.remove( "hue" );
        },
    };
}
