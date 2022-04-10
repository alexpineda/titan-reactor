

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
    uiPluginSystem.refresh();
    nativePluginSystem.enableAdditionalPlugins(plugins);
});


ipcRenderer.on(DISABLE_PLUGIN, (_, pluginId: string) => {
    nativePluginSystem.onDisable(pluginId);
    uiPluginSystem.refresh();
});

const _messageListener = function (event: MessageEvent) {
    if (event.data.type === "system:custom-message") {
        const { pluginId, message } = event.data.payload;
        nativePluginSystem.onUIMessage(pluginId, message);
    }
}
window.addEventListener("message", _messageListener);

export const initializePluginSystem = async (pluginPackages: InitializedPluginPackage[]) => {
    uiPluginSystem = new PluginSystemUI(pluginPackages);
    nativePluginSystem = new PluginSystemNative(pluginPackages, uiPluginSystem);
}

export const onClick = (event: MouseEvent) => {
    uiPluginSystem.sendMessage({
        type: SYSTEM_EVENT_MOUSE_CLICK,
        payload: {
            x: event.clientX,
            y: event.clientY,
            button: event.button
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

// optimized
export const onBeforeRender = (delta: number, elapsed: number) => {
    nativePluginSystem.onBeforeRender(delta, elapsed);
}

export const onRender = (delta: number, elapsed: number) => {
    nativePluginSystem.onRender(delta, elapsed);
}

export const callHookAsync = async (...args: Parameters<PluginSystemNative["callHookAsync"]>) => {
    await nativePluginSystem.callHookAsync(...args);
}

export const inject = (...args: Parameters<PluginSystemNative["inject"]>) => {
    return nativePluginSystem.inject(...args);
}

export const injectCallableWithPluginId = (...args: Parameters<PluginSystemNative["injectCallableWithPluginId"]>) => {
    return nativePluginSystem.injectCallableWithPluginId(...args);
}

export const installPluginLocal = async (repository: string) => {
    const pluginPackage = await installPlugin(repository);
    if (pluginPackage) {
        return pluginPackage;
    } else {
        return null;
    }
}