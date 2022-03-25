

import { ipcRenderer } from "electron";

import { InitializedPluginPackage } from "common/types";
import { ON_PLUGIN_CONFIG_UPDATED, ON_PLUGINS_ENABLED, DISABLE_PLUGIN } from "common/ipc-handle-names";
import { GameStatePosition } from "@core";
import {
    installPlugin
} from "@ipc/plugins";

import { SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED, SYSTEM_EVENT_PLUGINS_ENABLED, SYSTEM_EVENT_MOUSE_CLICK } from "./events";
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
    uiPluginSystem.sendMessage({
        type: SYSTEM_EVENT_PLUGINS_ENABLED,
        payload: {
            plugins
        }
    })
    nativePluginSystem.onPluginsEnabled(plugins);
});


ipcRenderer.on(DISABLE_PLUGIN, (_, pluginId: string) => {
    nativePluginSystem.onDispose(pluginId);
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

export const onFrame = (gameStatePosition: GameStatePosition, fps: string, playerDataAddr: number, productionDataAddr: number) => {
    uiPluginSystem.onFrame(gameStatePosition, fps, playerDataAddr, productionDataAddr);
    // nativePluginSystem.onFrame()
}

export const onGameReady = (...args: Parameters<PluginSystemNative["onGameReady"]>) => {
    nativePluginSystem.onGameReady(...args);
}

export const onGameDisposed = () => {
    uiPluginSystem.reset();
    nativePluginSystem.onGameDisposed();
}

export const onTerrainGenerated = (...args: Parameters<PluginSystemNative["onTerrainGenerated"]>) => {
    nativePluginSystem.onTerrainGenerated(...args);
}

export const installPluginLocal = async (repository: string) => {
    const pluginPackage = await installPlugin(repository);
    if (pluginPackage) {
        return pluginPackage;
    } else {
        return null;
    }
}