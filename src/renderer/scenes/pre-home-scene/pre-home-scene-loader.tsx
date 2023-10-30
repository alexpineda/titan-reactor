import sceneStore from "@stores/scene-store";
import { settingsStore } from "@stores/settings-store";
import { initializeAssets } from "@image/assets";
import { log } from "@ipc/log";
import { preloadIntro } from "../home/space-scene";
import { root } from "@render/root";
import { PreHomeScene } from "./pre-home-scene";
import { waitForTruthy } from "@utils/wait-for";
import { Filter, mixer } from "@audio";
import { SceneState } from "../scene";
import processStore from "@stores/process-store";
import gameStore, { useGameStore } from "@stores/game-store";
import { openCascStorageRemote } from "@ipc/casclib";

let _lastErrorMessage = "";

export async function preHomeSceneLoader(): Promise<SceneState> {
    processStore().create( "pre-home-scene", 7 );

    const urlParams = new URLSearchParams( window.location.search );
    const assetServerUrlParam = urlParams.get( "assetServerUrl" );
    const assetServerUrl =
        assetServerUrlParam ??
        localStorage.getItem( "assetServerUrl" ) ??
        "http://localhost:8080";

    const settings = await settingsStore().init();

    root.render( <PreHomeScene assetServerUrl={assetServerUrl} pluginsReady={false} /> );

    await waitForTruthy( async () => {
        const ok = await openCascStorageRemote( assetServerUrl );
        if ( ok ) {
            localStorage.setItem( "assetServerUrl", assetServerUrl );
            useGameStore.setState( { assetServerUrl } );
        }
        return gameStore().assetServerUrl;
    }, 5000 );

    await waitForTruthy( async () => {

        return await fetch(gameStore().uiRuntimeUrl, { method: "HEAD" }).then( ( res ) => res.ok );

    }, 5000);

    root.render( <PreHomeScene assetServerUrl={assetServerUrl} pluginsReady={true} /> );


    await initializeAssets();

    await preloadIntro();

    log.debug( "Loading intro" );

    mixer.setVolumes( settings.data.audio );

    const dropYourSocks = mixer.context.createBufferSource();
    dropYourSocks.buffer = await mixer.loadAudioBuffer(
        __static + "/three/drop-your-socks.mp3"
    );

    const _disconnect = mixer.connect(
        dropYourSocks,
        new Filter( mixer, "bandpass", 50 ).node,
        mixer.intro
    );

    dropYourSocks.onended = () => _disconnect();

    return {
        id: "@loading",
        start: () => {
            dropYourSocks.detune.setValueAtTime( -200, mixer.context.currentTime + 5 );
            dropYourSocks.start();
        },
        dispose: () => {},
    };
}
