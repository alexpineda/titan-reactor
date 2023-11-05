import { Buffer as BufferPolyfill } from "buffer";
globalThis.Buffer = BufferPolyfill;

import sceneStore from "../stores/scene-store";
import { logCapabilities } from "@utils/renderer-utils";
import "../scenes/home/home-scene";
import { preHomeSceneLoader } from "../scenes/pre-home-scene/pre-home-scene-loader";
import { homeSceneLoader } from "../scenes/home/home-scene-loader";
import { globalEvents } from "./global-events";
import { ValidatedReplay, loadAndValidateReplay } from "../scenes/replay-scene-loader";

import { useSettingsStore } from "@stores/settings-store";
import { log } from "@ipc/log";
import { settingsStore, useGameStore, useReplayAndMapStore } from "../stores";
import gameStore from "@stores/game-store";
import { mixer } from "@audio";
import { usePluginsStore } from "@stores/plugins-store";
import { initCacheDB } from "@image/loader/indexed-db-cache";
import { supabase, SUPABASE_REPLAY_BUCKET } from "common/supabase";
import { metaVerse } from "@stores/metaverse-store";
import { openFile } from "@ipc/files";
/**
 * ENTRY POINT FOR TITAN REACTOR
 */

performance.mark("start");

useSettingsStore.subscribe((payload) => {
    mixer.setVolumes(payload.data.audio);
});

metaVerse().events.on("load-replay", async (payload) => {
    console.log("preparing to load replay");
    const fileBuffer = await fetch(SUPABASE_REPLAY_BUCKET + payload.path).then((res) => res.arrayBuffer());
    settingsStore().lset("replayQueue.enabled", false);

    const replay = await loadAndValidateReplay(fileBuffer);

    if (!settingsStore().data.replayQueue.enabled) {
        useReplayAndMapStore.getState().clearReplayQueue();
        useReplayAndMapStore.getState().addReplayToQueue(replay);
        useReplayAndMapStore.getState().loadNextReplay();
        return;
    }
});

globalEvents.on("queue-files", async ({ files: _files }) => {
    if (_files.length === 0) {
        return;
    }

    const files: File[] = [];

    if (metaVerse().channel && metaVerse().isOwner) {
        if (_files[0].name.endsWith(".scx") || _files[0].name.endsWith(".scm")) {
            console.warn("maps not supported yet");
            return;
        }
        settingsStore().lset("replayQueue.enabled", false);
        const file = _files[0];
        console.log(metaVerse().room + "/" + file.name)
        const { data, error } = await supabase.storage
        .from('replays')
        .upload(metaVerse().room + "/" + file.name, file, {upsert: true} );

        if (data) {
            files.push(file);
            metaVerse().channel?.send({
                type: "broadcast",
                event: "load-replay",
                payload: {
                    name: file.name,
                    path: data.path,
                },
            })
        } else if (error) {
            console.error(error);
        }
    } else {
        files.push(..._files);
    }

    if (files.length === 0) {
        console.warn("no files to load")
        return;
    };
    
    //todo map stuff here
    if (files[0].name.endsWith(".scx") || files[0].name.endsWith(".scm")) {
        useReplayAndMapStore.getState().loadMap(files[0]);

        return;
    }

    const replays: ValidatedReplay[] = [];
    for (const file of files) {
        try {
            replays.push(await loadAndValidateReplay(await openFile( file )));
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
    }
});

logCapabilities();

(async function bootup() {
    // supabase.auth.startAutoRefresh();

    // const {
    //     data: { session },
    //     error: sessionError,
    // } = await supabase.auth.getSession();

    // if (sessionError) {
    //     log.error(sessionError);
    // }

    // if (!session) {
    //     console.log("no session");
    //     const email = prompt("Enter your blacksheepwall.tv username")!;

    //     if (email) {
    //         const res = await supabase.auth.signInWithOtp({
    //             email,
    //             options: {
    //                 emailRedirectTo: import.meta.env.BASE_URL
    //             }
    //         });

    //         if (res.error) {
    //             alert(res.error.message);
    //             return;
    //         }

    //         if (res.data.session) {
    //             alert("Check your email for a login link");
    //         }
    //     }
    // } else {
    //     console.log("session found");
    // }
    // metaVerse().setSession(session);

    await initCacheDB();

    await sceneStore().execSceneLoader(preHomeSceneLoader, "@loading");

    await sceneStore().execSceneLoader(homeSceneLoader, "@home");

    log.debug(`startup in ${performance.measure("start").duration}ms`);
})();

window.addEventListener("wheel", (evt) => evt.preventDefault(), { passive: false });

window.addEventListener("message", (event) => {
    if (event.data.type === "control-panel:connect") {
        useGameStore.setState({ configurationWindow: event.source as Window });
        gameStore().configurationWindow!.deps = { useSettingsStore, usePluginsStore };
        event.source!.postMessage(
            { type: "control-panel:connected" },
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
