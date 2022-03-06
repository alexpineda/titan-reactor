
import assert from "assert";

import { InitializedPluginConfiguration } from "common/types";

import * as log from "@ipc/log";
import { GameStatePosition } from "@core";
import { useSettingsStore, useGameStore, useScreenStore, useWorldStore } from "@stores";

import Plugin from "./plugin";
import { MSG_DIMENSIONS_CHANGED, MSG_PLUGINS_LOADED, MSG_ON_FRAME, MSG_SCREEN_CHANGED, MSG_WORLD_CHANGED } from "./messages";

let _plugins: Plugin[] = [];
let pluginsInitialized = false;

useSettingsStore.subscribe((settings) => {
    if (_plugins && pluginsInitialized) {
        log.warning("plugins already initialized");
        return;
    }
    pluginsInitialized = true;
    _plugins = initializePlugins(settings.pluginsConfigs);

    //FIXME: each message should have a create function
    const initialStore = {
        [MSG_DIMENSIONS_CHANGED]: useGameStore.getState().dimensions,
        [MSG_SCREEN_CHANGED]: {
            type: useScreenStore.getState().type,
            status: useScreenStore.getState().status,
            error: useScreenStore.getState().error
        },
        [MSG_WORLD_CHANGED]: useWorldStore.getState(),
        [MSG_ON_FRAME]: {
            frame: 0,
            maxFrame: 0,
            time: "",
            fps: "0"
        }
    }

    for (const plugin of _plugins) {
        log.info(`@plugin-system: plugin initialized - "${plugin.name}" - ${plugin.version} - ${plugin.enabled}`);
        if (plugin.isolatedContainer) {
            plugin.isolatedContainer.onload = () => plugin.isolatedContainer?.contentWindow?.postMessage({
                type: MSG_PLUGINS_LOADED,
                plugins: [settings.pluginsConfigs.find((p) => p.id === plugin.id)],
                initialStore
            }, "*");
            plugin.isolatedContainer.src = `http://localhost:${settings.data.plugins.serverPort}/runtime.html`;
        }
    }

    Plugin.sharedContainer.onload = () => Plugin.sharedContainer.contentWindow?.postMessage({
        type: MSG_PLUGINS_LOADED,
        plugins: settings.pluginsConfigs.filter(config => config.iframe !== "isolated"),
        initialStore
    }, "*");

    Plugin.sharedContainer.src = `http://localhost:${settings.data.plugins.serverPort}/runtime.html`;

});

useGameStore.subscribe((game, prev) => {
    if (game.dimensions !== prev.dimensions) {
        _sendMessage({
            type: MSG_DIMENSIONS_CHANGED,
            payload: game.dimensions
        });
    }
});

useScreenStore.subscribe((screen) => {
    _sendMessage({
        type: MSG_SCREEN_CHANGED,
        payload: {
            type: screen.type,
            status: screen.status,
            error: screen.error
        }
    });
});

useWorldStore.subscribe((world) => {
    _sendMessage({
        type: MSG_WORLD_CHANGED,
        payload: world
    });
});


let _lastSend: { [key: string]: any } = {};
const _replayPosition = {
    type: MSG_ON_FRAME,
    payload: {
        frame: 0,
        maxFrame: 0,
        time: "",
        fps: "0"
    }
}

export const onFrame = (gameStatePosition: GameStatePosition, fps: string) => {
    const time = gameStatePosition.getSecond();

    if (_lastSend[MSG_ON_FRAME] !== time) {
        _lastSend[MSG_ON_FRAME] = time;
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

export const initializePlugins = (pluginConfigs: InitializedPluginConfiguration[]) => {

    const plugins = pluginConfigs.map(pluginConfig => {
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
    }).filter(plugin => plugin !== undefined) as Plugin[];

    return plugins;
}
