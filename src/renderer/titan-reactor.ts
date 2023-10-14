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
import { ValidatedReplay, loadAndValidateReplay, replaySceneLoader } from "./scenes/replay-scene-loader";
import { interstitialSceneLoader } from "./scenes/interstitial-scene/interstitial-scene-loader";
import { useSettingsStore } from "@stores/settings-store";
import { log, logBoth, logClient } from "@ipc/log";
import { waitForSeconds, waitForTruthy } from "@utils/wait-for";
import { settingsStore, useGameStore, useReplayAndMapStore } from "./stores";

/**
 * ENTRY POINT FOR TITAN REACTOR VIEWER APP
 */

performance.mark("start");

globalEvents.on("command-center-save-settings", (payload) => {
    mixer.setVolumes(payload.data.audio);
    useSettingsStore.setState(payload);
});

// TODO: deprecate?
globalEvents.on("unsafe-open-url", (payload) => {
    openUrl(payload);
});

globalEvents.on(
    "load-home-scene",
    () => void sceneStore().execSceneLoader(homeSceneLoader, "@home")
);

globalEvents.on("log-message", ({ message, level, server }) =>
    server ? logBoth(message, level) : logClient(message, level)
);

//todo: change this to validatedmap
const loadMapFile = async (file: string) => {
    await sceneStore().execSceneLoader(homeSceneLoader, "@home");

    useReplayAndMapStore.getState().clearReplayQueue();

    void sceneStore().execSceneLoader(
        () => mapSceneLoader(file),
        "@map",
        {
            errorHandler: {
                loader: interstitialSceneLoader,
                id: "@interstitial",
            },
        }
    );
};

//todo add option to autoload file or show map/player list
export const loadQueuedReplay = async () => {
    if (useReplayAndMapStore.getState().replayQueue.length === 0 || useReplayAndMapStore.getState().nextReplay === undefined) {
        return;
    }

    await sceneStore().execSceneLoader(homeSceneLoader, "@home", {ignoreSameScene: true});

    if (useReplayAndMapStore.getState().replayQueue.length > 1) {
        await waitForSeconds(10);
    }

    void sceneStore().execSceneLoader(
        () => replaySceneLoader(useReplayAndMapStore.getState().nextReplay!),
        "@replay",
        {
            errorHandler: {
                loader: interstitialSceneLoader,
                id: "@interstitial",
            },
        }
    );
};


globalEvents.on("queue-files", async ({ files, append}) => {
    if (files.length === 0) {
        return;
    }
    //todo map stuff here
    if (files[0].endsWith('.scx') || files[0].endsWith('.scm')) {
        loadMapFile(files[0]);
        return;
    }

    if (!append ) {
        // useReplayAndMapStore.getState().flushWatchedReplays();
    }
    const replays: ValidatedReplay[] = [];
    for (const filepath of files) {
        try {
            replays.push(await loadAndValidateReplay(filepath));
        } catch (e) {
            console.error(e);
        }
    }

    useReplayAndMapStore.getState().addReplaysToQueue(replays);

    // if we're appending just let the current replay finish
    // otherwise load the next replay or show the replay list if its the first time loading replays
    // this allows the user to start from a replay in the middle if they want to watch a specific one
    if (!append ) {
        useReplayAndMapStore.getState().queueUpNextReplay(replays[0]);
        await sceneStore().execSceneLoader(homeSceneLoader, "@home");
        if (useReplayAndMapStore.getState().replayQueue.length === 1) {
            loadQueuedReplay();
        }
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

globalEvents.on("replay-complete", (replay) => {
    const duration = performance.now() - _startReplayTime!;
    useReplayAndMapStore.getState().addToTotalGameTime(duration);
    _startReplayTime = null;
    setTimeout(async () => {
        await queueNextReplay(replay);
        if (settingsStore().data.utilities.autoPlayReplayQueue) {
            loadQueuedReplay();
        }
        //todo show UI to stay on replay or go back to home
    }, 3000);
});

const queueNextReplay = (prevReplay: ValidatedReplay) => {
    const rIndex = useReplayAndMapStore.getState().replayQueue.findIndex(r => r === prevReplay);
    const nextReplay = useReplayAndMapStore.getState().replayQueue[rIndex + 1];
    useReplayAndMapStore.getState().queueUpNextReplay(nextReplay);
    return sceneStore().execSceneLoader(homeSceneLoader, "@home");
}

logCapabilities();
lockdown_();


(async function bootup() {
    await sceneStore().execSceneLoader(preHomeSceneLoader, "@loading");

    await sceneStore().execSceneLoader(homeSceneLoader, "@home");

    await waitForTruthy(() => useGameStore.getState().assets?.remaining === 0);

    log.debug(`startup in ${performance.measure("start").duration}ms`);
})();


