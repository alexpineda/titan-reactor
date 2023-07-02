import "./reset.css";
import "../../bundled/assets/open-props.1.4.min.css";
import sceneStore from "./stores/scene-store";
import { logCapabilities } from "@utils/renderer-utils";
import { lockdown_ } from "@utils/ses-util";
import "./scenes/home/home-scene";
import { preHomeSceneLoader } from "./scenes/pre-home-scene/pre-home-scene-loader";
import { homeSceneLoader } from "./scenes/home/home-scene-loader";
import { mixer } from "./core/global";
import { globalEvents } from "./core/global-events";
import { openUrl } from "@ipc/dialogs";
import { mapSceneLoader } from "./scenes/map-scene-loader";
import { replaySceneLoader } from "./scenes/replay-scene-loader";
import { interstitialSceneLoader } from "./scenes/interstitial-scene/interstitial-scene-loader";
import { useSettingsStore } from "@stores/settings-store";
import { log, logBoth, logClient } from "@ipc/log";
import { waitForTruthy } from "@utils/wait-for";
import { useGameStore } from "./stores";

performance.mark( "start" );

globalEvents.on( "command-center-save-settings", ( payload ) => {
    mixer.setVolumes( payload.data.audio );
    useSettingsStore.setState( payload );
} );

// TODO: deprecate?
globalEvents.on( "unsafe-open-url", ( payload ) => {
    openUrl( payload );
} );

globalEvents.on(
    "load-home-scene",
    () => void sceneStore().execSceneLoader( homeSceneLoader )
);

globalEvents.on( "log-message", ( { message, level, server } ) =>
    server ? logBoth( message, level ) : logClient( message, level )
);

globalEvents.on( "load-map-file", async ( map ) => {
    await sceneStore().execSceneLoader( interstitialSceneLoader );

    void sceneStore().execSceneLoader(
        () => mapSceneLoader( map ),
        interstitialSceneLoader
    );
} );

globalEvents.on( "load-replay-file", async ( replay: string ) => {
    await sceneStore().execSceneLoader( interstitialSceneLoader );

    void sceneStore().execSceneLoader(
        () => replaySceneLoader( replay ),
        interstitialSceneLoader
    );
} );

logCapabilities();
lockdown_();

( async function bootup() {
    await sceneStore().execSceneLoader( preHomeSceneLoader );

    await sceneStore().execSceneLoader( homeSceneLoader );

    await waitForTruthy( () => useGameStore.getState().assets?.remaining === 0 );

    log.debug( `startup in ${performance.measure( "start" ).duration}ms` );
} )();

// if ( process.env.NODE_ENV === "development" ) {
//     void import( "webgl-lint" );

//     void import( "spectorjs" ).then( ( module ) => {
//         const spector = new module.Spector();
//         spector.displayUI();
//         spector.spyCanvases();
//     } );
// }
