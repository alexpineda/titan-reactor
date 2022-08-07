import { UI_SYSTEM_OPEN_URL } from "../plugins/events";
import { openUrl } from "@ipc";
import { ipcRenderer } from "electron";
import {
    GO_TO_START_PAGE,
    LOG_MESSAGE,
    OPEN_MAP_DIALOG,
    OPEN_REPLAY_DIALOG,
    SEND_BROWSER_WINDOW,
} from "common/ipc-handle-names";
import { useSettingsStore } from "@stores";

import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import withErrorMessage from "common/utils/with-error-message";
import loadReplay from "../load-replay";
import * as log from "@ipc/log";
import sceneStore from "@stores/scene-store";
import loadMap from "../load-map";
import { loadHomePage } from "../load-home-page";
import { loadGameScene } from "../load-game-scene";

ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    async (
        _,
        {
            type,
            payload,
        }: {
            type: SendWindowActionType.CommitSettings;
            payload: SendWindowActionPayload<SendWindowActionType.CommitSettings>;
        }
    ) => {
        if (type === SendWindowActionType.CommitSettings) {
            useSettingsStore.setState(payload);
        }
    }
);

window.addEventListener("message", (evt) => {
    if (evt.data?.type === UI_SYSTEM_OPEN_URL) {
        log.verbose(`@open-url: ${evt.data.payload}`);
        openUrl(evt.data.payload);
    }
});

ipcRenderer.on(GO_TO_START_PAGE, () => {
    sceneStore().load(() => loadHomePage());
});

ipcRenderer.on(LOG_MESSAGE, async (_, message, level = "info") => {
    log.logClient(message, level);
});

window.onerror = (
    _: Event | string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
) => {
    log.error(withErrorMessage(`${lineno}:${colno} - ${source}`, error));
};

ipcRenderer.on(OPEN_MAP_DIALOG, async (_, map: string) => {
    await sceneStore().load(loadGameScene);
    sceneStore().load(() => loadMap(map));
});


ipcRenderer.on(OPEN_REPLAY_DIALOG, async (_, replay: string) => {
    await sceneStore().load(loadGameScene);
    sceneStore().load(() => loadReplay(replay));
});

ipcRenderer.on(
    SEND_BROWSER_WINDOW,
    async (
        _,
        {
            type,
            payload,
        }: {
            type: SendWindowActionType.LoadReplay;
            payload: SendWindowActionPayload<SendWindowActionType.LoadReplay>;
        }
    ) => {
        if (type === SendWindowActionType.LoadReplay) {
            await sceneStore().load(loadGameScene);
            sceneStore().load(() => loadReplay(payload));
        }
    }
);
