import { ipcRenderer } from "electron";

import { PluginMetaData } from "common/types";
import {
    ON_PLUGINS_ENABLED,
    DISABLE_PLUGIN,
    ON_PLUGINS_INITIAL_INSTALL_ERROR,
    SEND_BROWSER_WINDOW,
} from "common/ipc-handle-names";

import {
    UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
    UI_SYSTEM_MOUSE_CLICK,
} from "./events";
import { PluginSystemUI } from "./plugin-system-ui";
import { PluginSystemNative } from "./plugin-system-native";
import screenStore from "@stores/scene-store";
import { HOOK_ON_SCENE_DISPOSED } from "./hooks";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import settingsStore from "@stores/settings-store";
import Janitor from "@utils/janitor";


export const createPluginSession = async () => {

    const janitor = new Janitor;

    const pluginPackages = settingsStore().enabledPlugins;
    const uiPlugins = new PluginSystemUI(pluginPackages);
    const nativePlugins = new PluginSystemNative(pluginPackages, uiPlugins);

    await uiPlugins.isRunning();

    // When a plugin config has been updated in the config window
    janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, (_, { type, payload: { pluginId, config } }: {
        type: SendWindowActionType.PluginConfigChanged,
        payload: SendWindowActionPayload<SendWindowActionType.PluginConfigChanged>
    }) => {

        if (type === SendWindowActionType.PluginConfigChanged) {

            uiPlugins.sendMessage({
                type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                payload: { pluginId, config }
            });
            nativePlugins.hook_onConfigChanged(pluginId, config);

        }

    });

    // janitor.on(ipcRenderer, ON_PLUGINS_INITIAL_INSTALL, () => {
    //     uiPluginSystem.sendMessage({
    //         type: UI_SYSTEM_FIRST_INSTALL,
    //     });
    // });

    janitor.on(ipcRenderer, ON_PLUGINS_ENABLED, (_, plugins: PluginMetaData[]) => {
        uiPlugins.enablePlugins(plugins);
        nativePlugins.enableAdditionalPlugins(plugins);
    });

    janitor.on(ipcRenderer, DISABLE_PLUGIN, (_, pluginId: string) => {
        nativePlugins.hook_onPluginDispose(pluginId);
        uiPlugins.disablePlugin(pluginId);
    });

    janitor.on(ipcRenderer, ON_PLUGINS_INITIAL_INSTALL_ERROR, () => {
        screenStore().setError(new Error("Failed to install plugins"));
    });

    // export const injectApi = (
    //     ...args: Parameters<PluginSystemNative["injectApi"]>
    // ) => {
    //     return nativePluginSystem.injectApi(...args);
    // };

    return {
        nativePlugins,
        uiPlugins,
        onClick: (event: MouseEvent) => {

            uiPlugins.sendMessage({
                type: UI_SYSTEM_MOUSE_CLICK,
                payload: {
                    clientX: event.clientX,
                    clientY: event.clientY,
                    button: event.button,
                    shiftKey: event.shiftKey,
                    ctrlKey: event.ctrlKey,
                },
            });

        },
        dispose() {
            uiPlugins.reset();
            nativePlugins.callHook(HOOK_ON_SCENE_DISPOSED);
            uiPlugins.dispose();
            nativePlugins.dispose();
            janitor.dispose();
        }

    }

}