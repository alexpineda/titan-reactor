import { Buffer as BufferPolyfill } from "buffer";
globalThis.Buffer = BufferPolyfill;

import sceneStore from "../stores/scene-store";
import { logCapabilities } from "@utils/renderer-utils";
import { lockdown_ } from "@utils/ses-util";
import "../scenes/home/home-scene";
import { preHomeSceneLoader } from "../scenes/pre-home-scene/pre-home-scene-loader";
import { homeSceneLoader } from "../scenes/home/home-scene-loader";
import { globalEvents } from "./global-events";
import { ValidatedReplay, loadAndValidateReplay } from "../scenes/replay-scene-loader";

import { useSettingsStore } from "@stores/settings-store";
import { log, logBoth, logClient } from "@ipc/log";
import { waitForTruthy } from "@utils/wait-for";

import { settingsStore, useGameStore, useReplayAndMapStore } from "../stores";
import gameStore from "@stores/game-store";
import { mixer } from "@audio";
import { renderIngGameMenuScene } from "../scenes/in-game-menu/ingame-menu-scene";
import { usePluginsStore } from "@stores/plugins-store";
// import { supabase } from "common/supabase";
/**
 * ENTRY POINT FOR TITAN REACTOR VIEWER APP
 */

performance.mark("start");

useSettingsStore.subscribe((payload) => {
    mixer.setVolumes(payload.data.audio);
});

globalEvents.on("log-message", ({ message, level, server }) =>
    server ? logBoth(message, level) : logClient(message, level)
);

globalEvents.on("queue-files", async ({ files }) => {
    if (files.length === 0) {
        return;
    }
    //todo map stuff here
    if (files[0].name.endsWith(".scx") || files[0].name.endsWith(".scm")) {
        useReplayAndMapStore.getState().loadMap(files[0]);

        return;
    }

    const replays: ValidatedReplay[] = [];
    for (const file of files) {
        try {
            replays.push(await loadAndValidateReplay(file));
        } catch (e) {
            console.error(e);
        }
    }

    if (!settingsStore().data.replayQueue.enabled) {
        useReplayAndMapStore.getState().clearReplayQueue();
        useReplayAndMapStore.getState().addReplayToQueue(replays[0]);
        useReplayAndMapStore.getState().loadNextReplay();
        return;
    }

    useReplayAndMapStore.getState().addReplaysToQueue(replays);

    //todo: if we're in a game do we load?
    await sceneStore().execSceneLoader(homeSceneLoader, "@home", {
        ignoreSameScene: true,
    });

    useReplayAndMapStore.getState().loadNextReplay();
});

// manage total replay watch time
let _startReplayTime: number | null = 0;

globalEvents.on("replay-ready", () => {
    if (_startReplayTime) {
        const duration = performance.now() - _startReplayTime;
        useReplayAndMapStore.getState().addToTotalGameTime(duration);
    }
    _startReplayTime = performance.now();
});

globalEvents.on("replay-complete", async () => {
    const duration = performance.now() - _startReplayTime!;
    useReplayAndMapStore.getState().addToTotalGameTime(duration);
    _startReplayTime = null;


    if (
        settingsStore().data.replayQueue.enabled &&
        settingsStore().data.replayQueue.autoplay
    ) {
        await sceneStore().execSceneLoader(homeSceneLoader, "@home");
        useReplayAndMapStore.getState().loadNextReplay();
    } else {
        renderIngGameMenuScene(true);
    }
}); 

logCapabilities();
lockdown_();

(async function bootup() {
    // supabase.auth.startAutoRefresh();

    // const {
    //     data: { session },
    //     error: sessionError,
    // } = await supabase.auth.getSession();

    // if ( sessionError || session === null ) {
    //     if ( process.env.NODE_ENV === "development" ) {
    //         const email = prompt( "Enter your blacksheepwall.tv username" )!;
    //         const password = prompt( "Enter your blacksheepwall.tv password" )!;

    //         const res = await supabase.auth.signInWithPassword( {
    //             email,
    //             password,
    //         } );

    //         if ( res.error ) {
    //             alert( res.error.message );
    //             return;
    //         }

    //         if ( res.data.session ) {
    //             alert( "Login successful!" );
    //         }
    //     }
    // } else {
    await sceneStore().execSceneLoader(preHomeSceneLoader, "@loading");

    await sceneStore().execSceneLoader(homeSceneLoader, "@home");

    await waitForTruthy(() => useGameStore.getState().assets?.remaining === 0);

    log.debug(`startup in ${performance.measure("start").duration}ms`);
    // }
})();

window.addEventListener("wheel", (evt) => evt.preventDefault(), { passive: false });

window.addEventListener("message", (event) => {
    if (event.data.type === "connect") {
        useGameStore.setState({ configurationWindow: event.source as Window });
        gameStore().configurationWindow!.deps = { useSettingsStore, usePluginsStore };
        event.source!.postMessage(
            { type: "connected" },
            { targetOrigin: event.origin }
        );
    }
});

window.document.title = "Titan Reactor";

window.addEventListener("beforeunload", () => {
    if (gameStore().configurationWindow) {
        gameStore().configurationWindow!.close();
    }
});
