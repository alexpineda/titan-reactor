
import assert from "assert";

import { InitializedPluginPackage, ScreenStatus, ScreenType, Settings, SettingsMeta } from "common/types";

import * as log from "@ipc/log";
import { GameStatePosition } from "@core";
import { useGameStore, useScreenStore, useWorldStore, ScreenStore, GameStore } from "@stores";

import Plugin from "./plugin";
import { EVENT_DIMENSIONS_CHANGED, SYSTEM_EVENT_PLUGINS_LOADED, EVENT_ON_FRAME, EVENT_SCREEN_CHANGED, EVENT_WORLD_CHANGED, SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED, EVENT_LOG_ENTRY, SYSTEM_EVENT_ADD_PLUGIN } from "./messages";
import { ipcRenderer } from "electron";
import { ON_PLUGIN_CONFIG_UPDATED, RELOAD_PLUGINS, ON_PLUGIN_ENABLED } from "common/ipc-handle-names";
import settingsStore from "@stores/settings-store";
import {
    installPlugin
} from "@ipc/plugins";

ipcRenderer.on(ON_PLUGIN_CONFIG_UPDATED, (_, pluginId: string, config: any) => {
    _sendMessage({
        type: SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED,
        pluginId,
        config
    })
});

ipcRenderer.on(ON_PLUGIN_ENABLED, (_, plugin: InitializedPluginPackage) => {
    _sendMessage({
        type: SYSTEM_EVENT_ADD_PLUGIN,
        plugin
    })
});

const reloadPlugins = () => {
    const settings = settingsStore().data;

    Plugin.sharedContainer.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
    for (const plugin of _plugins) {
        if (plugin.isolatedContainer) {
            plugin.isolatedContainer.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
        }
    }
}
ipcRenderer.on(RELOAD_PLUGINS, reloadPlugins);

let _plugins: Plugin[] = [];

// TODO: 1) Remove isolatedContainers and treat them as unique systems
//       2) Move all event handlers into initializeSystem or create PluginSystem Class
export const initializePluginSystem = (pluginPackages: InitializedPluginPackage[]) => {
    _plugins = pluginPackages.map(initializePlugin).filter(plugin => plugin !== undefined) as Plugin[];

    const initialStore = () => ({
        [EVENT_DIMENSIONS_CHANGED]: useGameStore.getState().dimensions,
        [EVENT_SCREEN_CHANGED]: screenChanged(useScreenStore.getState()).payload,
        [EVENT_WORLD_CHANGED]: useWorldStore.getState(),
        [EVENT_ON_FRAME]: _replayPosition.payload,
        [EVENT_LOG_ENTRY]: logChanged(useGameStore.getState()).payload
    })

    for (const plugin of _plugins) {
        log.info(`@plugin-system: plugin initialized - "${plugin.name}" - ${plugin.version}`);
        if (plugin.isolatedContainer) {
            plugin.isolatedContainer.onload = () => plugin.isolatedContainer?.contentWindow?.postMessage({
                type: SYSTEM_EVENT_PLUGINS_LOADED,
                plugins: [pluginPackages.find((p) => p.id === plugin.id)],
                initialStore: initialStore()
            }, "*");
        }
    }

    Plugin.sharedContainer.onload = () => Plugin.sharedContainer.contentWindow?.postMessage({
        type: SYSTEM_EVENT_PLUGINS_LOADED,
        plugins: pluginPackages.filter(config => config.iframe !== "isolated"),
        initialStore: initialStore()
    }, "*");

    document.body.appendChild(Plugin.sharedContainer);

    reloadPlugins();

};

const logChanged = (game: GameStore) => {
    return {
        type: EVENT_LOG_ENTRY,
        payload: game.log
    }
}

useGameStore.subscribe((game, prev) => {
    if (game.dimensions !== prev.dimensions) {
        _sendMessage({
            type: EVENT_DIMENSIONS_CHANGED,
            payload: game.dimensions
        });
    }

    if (game.log !== prev.log) {
        _sendMessage(logChanged(game));
    }
});

const screenChanged = (screen: ScreenStore) => {
    return {
        type: EVENT_SCREEN_CHANGED,
        payload: {
            screen: `@${ScreenType[screen.type]}/${ScreenStatus[screen.status]}`.toLowerCase(),
            error: screen.error?.message
        }
    }
}

useScreenStore.subscribe((screen) => {
    _sendMessage(screenChanged(screen));
});

useWorldStore.subscribe((world) => {
    _sendMessage({
        type: EVENT_WORLD_CHANGED,
        payload: world
    });
});


let _lastSend: { [key: string]: any } = {};
const _replayPosition = {
    type: EVENT_ON_FRAME,
    payload: {
        frame: 0,
        maxFrame: 0,
        time: "",
        fps: "0"
    }
}

export const onFrame = (gameStatePosition: GameStatePosition, fps: string) => {
    const time = gameStatePosition.getSecond();

    if (_lastSend[EVENT_ON_FRAME] !== time) {
        _lastSend[EVENT_ON_FRAME] = time;
        _replayPosition.payload.frame = gameStatePosition.bwGameFrame;
        _replayPosition.payload.maxFrame = gameStatePosition.maxFrame;
        _replayPosition.payload.time = gameStatePosition.getFriendlyTime();
        _replayPosition.payload.fps = fps;

        _sendMessage(_replayPosition);
    }
}

export const resetSendStates = () => {
    _lastSend = {};
}

const _sendMessage = (message: any) => {
    for (const plugin of _plugins) {
        if (plugin.isolatedContainer) {
            plugin.isolatedContainer.contentWindow?.postMessage(message, "*");
        }
    }

    Plugin.sharedContainer.contentWindow?.postMessage(message, "*");
}

const initializePlugin = (pluginConfig: InitializedPluginPackage): Plugin | undefined => {
    let plugin;

    try {
        if (pluginConfig.nativeSource) {
            plugin = Object.create(Plugin, Function(pluginConfig.nativeSource!)());
            pluginConfig.nativeSource = undefined;

            assert(plugin.onInitialized, "onInitialized is required");
            assert(plugin.onFrame, "onFrame is required");
        } else {
            plugin = new Plugin(pluginConfig);
        }

        plugin.onInitialized(pluginConfig);

    } catch (e: unknown) {
        if (e instanceof Error) {
            log.error(`@plugin-system: failed to initialize "${pluginConfig.name}" - ${e.message}`);
        }
    }
    return plugin;
};

export const installPluginLocal = async (repository: string) => {
    const pluginPackage = await installPlugin(repository);
    if (pluginPackage) {
        const plugin = initializePlugin(pluginPackage);
        if (plugin) {
            _plugins.push(plugin);
            return pluginPackage;
        } else {
            return null
        }
    } else {
        return null;
    }
}