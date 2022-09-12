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
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import settingsStore from "@stores/settings-store";
import Janitor from "@utils/janitor";
import { Macros } from "@macros/macros";
import { createReactivePluginApi } from "@stores/session/reactive-plugin-variables";


export const createPluginSession = async (macros: Macros) => {

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

            //TODO: diff
            uiPlugins.sendMessage({
                type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                payload: { pluginId, config }
            });
            nativePlugins.hook_onConfigChanged(pluginId, config);

        }

    });

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


    nativePlugins.externalHookListener = (...args) => macros.callFromHook(...args);

    // available to macros and sandbox only
    const reactiveApi = janitor.mop(createReactivePluginApi(nativePlugins));

    macros.getPluginProperty = reactiveApi.getRawValue;
    macros.doPluginAction = (action) => {
        const result = reactiveApi.applyEffectFromAction(action);
        if (result) {
            uiPlugins.sendMessage({
                type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                payload: result
            });
        }
    };

    const _clickPassThrough = (evt: MouseEvent) => uiPlugins.sendMessage({
        type: UI_SYSTEM_MOUSE_CLICK,
        payload: {
            clientX: evt.clientX,
            clientY: evt.clientY,
            button: evt.button,
            shiftKey: evt.shiftKey,
            ctrlKey: evt.ctrlKey,
        },
    });


    document.body.addEventListener("mouseup", _clickPassThrough);
    janitor.mop(() => document.body.removeEventListener("mouseup", _clickPassThrough));

    return {
        nativePlugins,
        uiPlugins,
        reactiveApi,
        dispose() {
            uiPlugins.reset();
            uiPlugins.dispose();
            nativePlugins.dispose();
            janitor.dispose();
        },

    }

}