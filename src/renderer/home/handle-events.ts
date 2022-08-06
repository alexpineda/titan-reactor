import { UI_SYSTEM_OPEN_URL } from "../plugins/events";
import { openUrl } from "@ipc";
import { ScreenType } from "common/types";
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
import loadMap from "../load-map";
import loadReplay from "../load-replay";
import processStore from "@stores/process-store";
import screenStore from "@stores/screen-store";
import * as log from "@ipc/log";

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
    if (!processStore().hasAnyProcessIncomplete()) {
        screenStore().init(ScreenType.Home);
        screenStore().complete();
    }
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
    try {
        loadMap(map);
    } catch (err: any) {
        log.error(err.message);
        screenStore().setError(err);
    }
});

const _loadReplay = (replay: string) => {
    try {
        loadReplay(replay);
    } catch (err: any) {
        log.error(err.message);
        screenStore().setError(err);
    }
};

ipcRenderer.on(OPEN_REPLAY_DIALOG, (_, replay: string) => {
    _loadReplay(replay);
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
            _loadReplay(payload);
        }
    }
);
