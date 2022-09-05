import { ipcRenderer } from "electron";

import { PluginMetaData, MacroActionPlugin, OpenBWAPI } from "common/types";
import {
    ON_PLUGINS_ENABLED,
    DISABLE_PLUGIN,
    ON_PLUGINS_INITIAL_INSTALL_ERROR,
    ON_PLUGINS_INITIAL_INSTALL,
    SEND_BROWSER_WINDOW,
} from "common/ipc-handle-names";

import {
    UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
    UI_SYSTEM_MOUSE_CLICK,
    UI_SYSTEM_FIRST_INSTALL,
} from "./events";
import { PluginSystemUI } from "./plugin-system-ui";
import { PluginSystemNative, SceneController } from "./plugin-system-native";
import screenStore from "@stores/scene-store";
import { HOOK_ON_SCENE_DISPOSED } from "./hooks";
import { Macros } from "@macros/macros";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import settingsStore from "@stores/settings-store";

let uiPluginSystem: PluginSystemUI;
let nativePluginSystem: PluginSystemNative;

/**
 * A plugin config has been updated in the config window
 */
ipcRenderer.on(SEND_BROWSER_WINDOW, (_, { type, payload: { pluginId, config } }: {
    type: SendWindowActionType.PluginConfigChanged,
    payload: SendWindowActionPayload<SendWindowActionType.PluginConfigChanged>
}) => {
    if (type === SendWindowActionType.PluginConfigChanged) {
        uiPluginSystem.sendMessage({
            type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
            payload: { pluginId, config }
        });
        nativePluginSystem.hook_onConfigChanged(pluginId, config);
    }
});

ipcRenderer.on(ON_PLUGINS_INITIAL_INSTALL, () => {
    uiPluginSystem.sendMessage({
        type: UI_SYSTEM_FIRST_INSTALL,
    });
});

ipcRenderer.on(ON_PLUGINS_ENABLED, (_, plugins: PluginMetaData[]) => {
    uiPluginSystem.enablePlugins(plugins);
    nativePluginSystem.enableAdditionalPlugins(plugins);
});

ipcRenderer.on(DISABLE_PLUGIN, (_, pluginId: string) => {
    nativePluginSystem.hook_onPluginDispose(pluginId);
    uiPluginSystem.disablePlugin(pluginId);
});

ipcRenderer.on(ON_PLUGINS_INITIAL_INSTALL_ERROR, () => {
    screenStore().setError(new Error("Failed to install plugins"));
});

export const initializePluginSystem = async (reload = false) => {
    if ((uiPluginSystem || nativePluginSystem) && !reload) {
        throw new Error("Plugin system already initialized. Use reload=true to reinitialize");
    }

    if (uiPluginSystem) {
        uiPluginSystem.dispose();
    }

    if (nativePluginSystem) {
        nativePluginSystem.dispose();
    }

    const pluginPackages = settingsStore().enabledPlugins;

    uiPluginSystem = new PluginSystemUI(pluginPackages);
    nativePluginSystem = new PluginSystemNative(pluginPackages, uiPluginSystem);

    await uiPluginSystem.isRunning();
};

export const onClick = (event: MouseEvent) => {
    uiPluginSystem.sendMessage({
        type: UI_SYSTEM_MOUSE_CLICK,
        payload: {
            clientX: event.clientX,
            clientY: event.clientY,
            button: event.button,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
        },
    });
};

export const onFrame = (
    openBw: OpenBWAPI,
    currentFrame: number,
    playerDataAddr: number,
    productionDataAddr: number,
    commands: any[]
) => {
    uiPluginSystem.onFrame(openBw, currentFrame, playerDataAddr, productionDataAddr);
    nativePluginSystem.hook_onFrame(
        currentFrame,
        commands
    );
};

export const getSceneInputHandlers = () => {
    return nativePluginSystem.getSceneInputHandlers();
};

export const getSceneInputHandler = (name: string) => {
    return nativePluginSystem.getSceneInputHandlers().find((handler) => handler.name === name);
};

export const callHook = (
    ...args: Parameters<PluginSystemNative["callHook"]>
) => {
    nativePluginSystem.callHook(...args);
};

export const callHookAsync = async (
    ...args: Parameters<PluginSystemNative["callHookAsync"]>
) => {
    await nativePluginSystem.callHookAsync(...args);
};

export const injectApi = (
    ...args: Parameters<PluginSystemNative["injectApi"]>
) => {
    return nativePluginSystem.injectApi(...args);
};

/**
 * We don't use the generic callHook here in order to reduce object allocation
 */
export const disposeGame = () => {
    uiPluginSystem.reset();
    nativePluginSystem.callHook(HOOK_ON_SCENE_DISPOSED);
};

export const onBeforeRender = (
    delta: number,
    elapsed: number,
) => {
    nativePluginSystem.hook_onBeforeRender(delta, elapsed);
};

export const onRender = (delta: number, elapsed: number) => {
    nativePluginSystem.hook_onRender(delta, elapsed);
};

export const doMacroAction = (action: MacroActionPlugin) => {
    const result = nativePluginSystem.doMacroAction(action);
    if (result) {
        uiPluginSystem.sendMessage({
            type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
            payload: result
        });
    }
}

export const setAllMacroDefaults = (macros: Macros) => {
    for (const macro of macros) {
        nativePluginSystem.setAllMacroDefaults(macro);
    }
}

export const setMacroDefaults = (macros: Macros, pluginId: string, config: any) => {
    for (const macro of macros) {
        nativePluginSystem.setMacroDefaults(macro, pluginId, config);
    }
}


export const setSceneController = (plugin: SceneController) => {
    nativePluginSystem.setActiveSceneInputHandler(plugin);
}

export const getPluginByName = (name: string) => {
    return nativePluginSystem.getByName(name);
}