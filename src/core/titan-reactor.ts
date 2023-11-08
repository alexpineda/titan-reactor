import { Buffer as BufferPolyfill } from "buffer";
globalThis.Buffer = BufferPolyfill;

import sceneStore from "../stores/scene-store";
import { logCapabilities } from "@utils/renderer-utils";
import "../scenes/home/home-scene-ui";
import { globalEvents } from "./global-events";
import { ValidatedReplay, loadAndValidateReplay } from "../scenes/load-and-validate-replay";

import { useSettingsStore, useMacroStore} from "@stores/settings-store";
import { log } from "@ipc/log";
import { settingsStore, useGameStore, useReplayAndMapStore } from "../stores";
import gameStore from "@stores/game-store";
import { mixer } from "@audio";
import { usePluginsStore } from "@stores/plugins-store";
import { initCacheDB } from "@image/loader/indexed-db-cache";
import { supabase, SUPABASE_REPLAY_BUCKET } from "common/supabase";
import { metaVerse } from "@stores/metaverse-store";
import { PreProcessFile } from "@ipc/files";
import { HomeScene } from "../scenes/home-scene";
import { LoadingScene } from "../scenes/loading-scene";
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

    if (settingsStore().data.replayQueue.alwaysClearReplayQueue) {
        useReplayAndMapStore.getState().clearReplayQueue();
    }

    useReplayAndMapStore.getState().addReplayToQueue(replay);

    if (settingsStore().data.replayQueue.autoplay) {
        useReplayAndMapStore.getState().loadNextReplay();
    }
});



globalEvents.on("queue-files", async ({ files: _files }) => {
    if (_files.length === 0) {
        return;
    }

    const files: PreProcessFile[] = [];

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
        .upload(metaVerse().room + "/" + file.name, file.buffer, {upsert: true} );

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
        useReplayAndMapStore.getState().loadMap(files[0].buffer);
        return;
    }

    const replays: ValidatedReplay[] = [];
    for (const file of files) {
        try {
            replays.push(await loadAndValidateReplay(file.buffer));
        } catch (e) {
            console.error(e);
        }
    }

    if (settingsStore().data.replayQueue.alwaysClearReplayQueue) {
        useReplayAndMapStore.getState().clearReplayQueue();
    }

    useReplayAndMapStore.getState().addReplaysToQueue(replays);

    if (settingsStore().data.replayQueue.autoplay) {
        useReplayAndMapStore.getState().loadNextReplay();
    }
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

    if (settingsStore().data.replayQueue.goToHomeBetweenReplays) {
        await sceneStore().loadScene(new HomeScene(), {
            ignoreSameScene: true,
        });
    }

    if (
        settingsStore().data.replayQueue.autoplay
    ) {
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

    await sceneStore().loadScene(new LoadingScene());

    await sceneStore().loadScene(new HomeScene());

    log.debug(`startup in ${performance.measure("start").duration}ms`);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("replays")) {
        const replays = urlParams.get("replays")!.split(",");

        const files = [];
        for ( const file of replays ) {
            files.push({
                name: file,
                buffer: await fetch(file).then((res) => res.arrayBuffer()),
            })
        }
        globalEvents.emit( "queue-files", {
            files,
        } );
    }


})();

window.addEventListener("wheel", (evt) => evt.preventDefault(), { passive: false });

window.addEventListener("message", (event) => {
    if (event.data.type === "control-panel:connect") {
        useGameStore.setState({ configurationWindow: event.source as Window });
        gameStore().configurationWindow!.deps = { useSettingsStore, usePluginsStore, useMacroStore };
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

window.addEventListener("contextmenu", (evt) => {
    evt.preventDefault();
});
