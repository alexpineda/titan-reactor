

import { InitializedPluginPackage, } from "common/types";

import { GameStatePosition } from "@core";

import { SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED, SYSTEM_EVENT_PLUGINS_ENABLED, SYSTEM_EVENT_MOUSE_CLICK } from "./messages";
import { ipcRenderer } from "electron";
import { ON_PLUGIN_CONFIG_UPDATED, ON_PLUGINS_ENABLED } from "common/ipc-handle-names";
import {
    installPlugin
} from "@ipc/plugins";
import { PluginSystemUI } from "./plugin-system-ui";


ipcRenderer.on(ON_PLUGIN_CONFIG_UPDATED, (_, pluginId: string, config: any) => {
    _sendMessage({
        type: SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED,
        payload: {
            pluginId,
            config
        }
    })
});

ipcRenderer.on(ON_PLUGINS_ENABLED, (_, plugins: InitializedPluginPackage[]) => {
    _sendMessage({
        type: SYSTEM_EVENT_PLUGINS_ENABLED,
        payload: {
            plugins
        }
    })
});

let uiPluginSystem: PluginSystemUI;
// let nativePluginSystem: PluginSystemNative;

export const initializePluginSystem = async (pluginPackages: InitializedPluginPackage[]) => {
    uiPluginSystem = new PluginSystemUI(pluginPackages);
}

export const onClick = (event: MouseEvent) => {
    _sendMessage({
        type: SYSTEM_EVENT_MOUSE_CLICK,
        payload: {
            x: event.clientX,
            y: event.clientY
        }
    })
}

export const onFrame = (gameStatePosition: GameStatePosition, fps: string, playerDataAddr: number, productionDataAddr: number) => {
    uiPluginSystem.onFrame(gameStatePosition, fps, playerDataAddr, productionDataAddr);
}

export const reset = () => {
    uiPluginSystem.reset();
}

const _sendMessage = (message: any) => {
    uiPluginSystem.sendMessage(message);
}

export const installPluginLocal = async (repository: string) => {
    const pluginPackage = await installPlugin(repository);
    if (pluginPackage) {
        //TODO: if plugin has native component, initialize otherwise return null on error
        return pluginPackage;
    } else {
        return null;
    }
}