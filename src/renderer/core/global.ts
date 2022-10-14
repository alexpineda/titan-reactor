import { UI_SYSTEM_OPEN_URL } from "@plugins/events";
import { ipcRenderer, IpcRendererEvent } from "electron";
import {
    DISABLE_PLUGIN,
    GO_TO_START_PAGE,
    LOG_MESSAGE,
    ON_PLUGINS_ENABLED,
    ON_PLUGINS_INITIAL_INSTALL,
    ON_PLUGINS_INITIAL_INSTALL_ERROR,
    OPEN_ISCRIPTAH,
    OPEN_MAP_DIALOG,
    OPEN_REPLAY_DIALOG,
    SEND_BROWSER_WINDOW,
    SERVER_API_FIRE_MACRO,
} from "common/ipc-handle-names";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { withErrorMessage } from "common/utils/with-error-message";
import { PluginMetaData } from "common/types";
import { MainMixer } from "@audio/main-mixer";
import { Music } from "@audio/music";
import { AudioListener } from "three";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor, JanitorLogLevel } from "three-janitor";
import { globalEvents } from "./global-events";
import { setStorageIsCasc, setStoragePath } from "common/casclib";

export const mixer = new MainMixer();
export const music = new Music(mixer as unknown as AudioListener);

// todo: stores

window.addEventListener("message", (evt) => evt.data?.type === UI_SYSTEM_OPEN_URL && globalEvents.emit("unsafe-open-url", evt.data.payload));

ipcRenderer.on(GO_TO_START_PAGE, () => globalEvents.emit("load-home-scene"));
ipcRenderer.on(LOG_MESSAGE, async (_, message, level = "info") => globalEvents.emit("log-message", { message, level }));

ipcRenderer.on(OPEN_MAP_DIALOG, async (_, map: string) => globalEvents.emit("load-map-file", map));

ipcRenderer.on(OPEN_REPLAY_DIALOG, async (_, replay: string) => globalEvents.emit("load-replay-file", replay));

ipcRenderer.on(OPEN_ISCRIPTAH, async () => globalEvents.emit("load-iscriptah"));

//TODO: type better
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
            globalEvents.emit("command-center-save-settings", payload);
        }
    }
);

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
            globalEvents.emit("load-replay-file", payload);
        }
    }
);

ipcRenderer.on(SEND_BROWSER_WINDOW, (_, { type, payload: { pluginId, config } }: {
    type: SendWindowActionType.PluginConfigChanged,
    payload: SendWindowActionPayload<SendWindowActionType.PluginConfigChanged>
}) => {

    if (type === SendWindowActionType.PluginConfigChanged) {

        globalEvents.emit("command-center-plugin-config-changed", { pluginId, config });

    }

});

ipcRenderer.on(ON_PLUGINS_ENABLED, (_, plugins: PluginMetaData[]) => globalEvents.emit("command-center-plugins-enabled", plugins));
ipcRenderer.on(DISABLE_PLUGIN, (_, pluginId: string) => globalEvents.emit("command-center-plugin-disabled", pluginId));
ipcRenderer.on(ON_PLUGINS_INITIAL_INSTALL_ERROR, () => globalEvents.emit("initial-install-error-plugins"));

ipcRenderer.on(SERVER_API_FIRE_MACRO, (_: IpcRendererEvent, macroId: string) => globalEvents.emit("exec-macro", macroId));

ipcRenderer.on(ON_PLUGINS_INITIAL_INSTALL, () => {
    useSettingsStore.setState({ initialInstall: true });
});

ipcRenderer.on(SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
    type: SendWindowActionType.ManualMacroTrigger,
    payload: SendWindowActionPayload<SendWindowActionType.ManualMacroTrigger>
}) => {
    if (type === SendWindowActionType.ManualMacroTrigger) {
        globalEvents.emit("exec-macro", payload);
    }
});

ipcRenderer.on(SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
    type: SendWindowActionType.ResetMacroActions,
    payload: SendWindowActionPayload<SendWindowActionType.ResetMacroActions>
}) => {
    if (type === SendWindowActionType.ResetMacroActions) {
        globalEvents.emit("reset-macro-actions", payload);
    }
});

ipcRenderer.on(SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
    type: SendWindowActionType.ManualMacroActionTrigger,
    payload: SendWindowActionPayload<SendWindowActionType.ManualMacroActionTrigger>
}) => {
    if (type === SendWindowActionType.ManualMacroActionTrigger) {
        globalEvents.emit("exec-macro-action", payload);
    }
});

if (process.env.NODE_ENV !== "development") {
    window.onerror = (
        _: Event | string,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error
    ) => {
        globalEvents.emit("log-message", { message: withErrorMessage(error, `${lineno}:${colno} - ${source}`), level: "error" });
    };
}

document.addEventListener("visibilitychange", () => globalEvents.emit("document-hidden", document.hidden), false);

export const getJanitorLogLevel = () => {

    switch (settingsStore().data.utilities.logLevel) {
        case "debug":
            return JanitorLogLevel.Debug;
        case "info":
            return JanitorLogLevel.Info;
        case "warn":
        case "error":
    }

    return JanitorLogLevel.None;
}

useSettingsStore.subscribe((settings) => {

    Janitor.logLevel = getJanitorLogLevel();

    setStorageIsCasc(settings.isCascStorage);
    setStoragePath(settings.data.directories.starcraft);

});