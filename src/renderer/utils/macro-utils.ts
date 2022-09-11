import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { Macros } from "@macros/macros";
import { PluginSystemNative } from "@plugins/plugin-system-native";
import settingsStore from "@stores/settings-store";
import { SEND_BROWSER_WINDOW, SERVER_API_FIRE_MACRO } from "common/ipc-handle-names";
import { ipcRenderer, IpcRendererEvent } from "electron";
import Janitor from "./janitor";

export const listenToEvents = (macros: Macros, nativePlugins: PluginSystemNative) => {
    const janitor = new Janitor;

    macros.setHostDefaults(settingsStore().data);
    for (const macro of macros) {
        nativePlugins.setAllMacroDefaults(macro);
    }

    janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, async (_: any, { type, payload: { pluginId, config } }: {
        type: SendWindowActionType.PluginConfigChanged
        payload: SendWindowActionPayload<SendWindowActionType.PluginConfigChanged>
    }) => {
        if (type === SendWindowActionType.PluginConfigChanged) {
            for (const macro of macros) {
                nativePlugins.setMacroDefaults(macro, pluginId, config);
            }
        }
    })

    janitor.mop(macros.listenForKeyCombos());

    janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
        type: SendWindowActionType.ManualMacroTrigger,
        payload: SendWindowActionPayload<SendWindowActionType.ManualMacroTrigger>
    }) => {
        if (type === SendWindowActionType.ManualMacroTrigger) {
            macros.execMacroById(payload);
        }
    });

    janitor.on(ipcRenderer, SERVER_API_FIRE_MACRO, (_: IpcRendererEvent, macroId: string) => {
        macros.execMacroById(macroId);
    });

    return janitor;
}