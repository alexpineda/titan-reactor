

import { ipcRenderer } from "electron";

import { InitializedPluginPackage } from "common/types";
import { ON_PLUGIN_CONFIG_UPDATED, ON_PLUGINS_ENABLED, DISABLE_PLUGIN } from "common/ipc-handle-names";
import { GameStatePosition } from "@core";
import {
    installPlugin
} from "@ipc/plugins";

import { SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED, SYSTEM_EVENT_MOUSE_CLICK } from "./events";
import { PluginSystemUI } from "./plugin-system-ui";
import { PluginSystemNative } from "./plugin-system-native";

let uiPluginSystem: PluginSystemUI;
let nativePluginSystem: PluginSystemNative;

ipcRenderer.on(ON_PLUGIN_CONFIG_UPDATED, (_, pluginId: string, config: any) => {
    uiPluginSystem.sendMessage({
        type: SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED,
        payload: {
            pluginId,
            config
        }
    })
    nativePluginSystem.onConfigChanged(pluginId, config);
});

ipcRenderer.on(ON_PLUGINS_ENABLED, (_, plugins: InitializedPluginPackage[]) => {
    uiPluginSystem.reload();
    nativePluginSystem.enableAdditionalPlugins(plugins);
});


ipcRenderer.on(DISABLE_PLUGIN, (_, pluginId: string) => {
    nativePluginSystem.onDisable(pluginId);
    //FIXME: only reload if plugin has ui
    uiPluginSystem.reload();
});

export const initializePluginSystem = async (pluginPackages: InitializedPluginPackage[]) => {
    uiPluginSystem = new PluginSystemUI(pluginPackages);
    nativePluginSystem = new PluginSystemNative(pluginPackages);
}

export const onClick = (event: MouseEvent) => {
    uiPluginSystem.sendMessage({
        type: SYSTEM_EVENT_MOUSE_CLICK,
        payload: {
            x: event.clientX,
            y: event.clientY
        }
    })
}

export const onFrame = (gameStatePosition: GameStatePosition, playerDataAddr: number, productionDataAddr: number) => {
    uiPluginSystem.onFrame(gameStatePosition, playerDataAddr, productionDataAddr);
    // nativePluginSystem.onFrame()
}

export const onGameDisposed = () => {
    uiPluginSystem.reset();
    nativePluginSystem.callHook("onGameDisposed");
}

export const callHook = (...args: Parameters<PluginSystemNative["callHook"]>) => {
    nativePluginSystem.callHook(...args);
}

export const installPluginLocal = async (repository: string) => {
    const pluginPackage = await installPlugin(repository);
    if (pluginPackage) {
        return pluginPackage;
    } else {
        return null;
    }
}