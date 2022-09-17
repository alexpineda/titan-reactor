import { UI_SYSTEM_OPEN_URL } from "@plugins/events";
import { LogType } from "@ipc";
import { ipcRenderer, IpcRendererEvent } from "electron";
import {
    DISABLE_PLUGIN,
    GO_TO_START_PAGE,
    LOG_MESSAGE,
    ON_PLUGINS_ENABLED,
    ON_PLUGINS_INITIAL_INSTALL_ERROR,
    OPEN_ISCRIPTAH,
    OPEN_MAP_DIALOG,
    OPEN_REPLAY_DIALOG,
    SEND_BROWSER_WINDOW,
    SERVER_API_FIRE_MACRO,
} from "common/ipc-handle-names";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { withErrorMessage } from "common/utils/with-error-message";
import { TypeEmitter } from "@utils/type-emitter";
import { PluginMetaData, SettingsMeta } from "common/types";


export interface GlobalEvents {
    "webglcontextlost": void;
    "webglcontextrestored": void;
    "command-center-save-settings": SettingsMeta;
    "command-center-plugin-config-changed": { pluginId: string, config: any };
    "command-center-plugins-enabled": PluginMetaData[];
    "command-center-plugin-disabled": string;
    "unsafe-open-url": string;
    "load-home-scene": void;
    "load-replay-file": string;
    "load-map-file": string;
    "load-iscriptah": string;
    "log-message": { message: string, level: LogType, server?: boolean };
    "initial-install-error-plugins": void;
    "exec-macro": string;
}

/**
 * Centralized event emitter for global events.
 */
export const globalEvents = new TypeEmitter<GlobalEvents>();

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

ipcRenderer.on(SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
    type: SendWindowActionType.ManualMacroTrigger,
    payload: SendWindowActionPayload<SendWindowActionType.ManualMacroTrigger>
}) => {
    if (type === SendWindowActionType.ManualMacroTrigger) {
        globalEvents.emit("exec-macro", payload);
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