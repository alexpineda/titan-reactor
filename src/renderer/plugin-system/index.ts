
import assert from "assert";

import { InitializedPluginPackage, ScreenStatus, ScreenType } from "common/types";

import * as log from "@ipc/log";
import { GameStatePosition } from "@core";
import { useGameStore, useScreenStore, useWorldStore, ScreenStore, GameStore } from "@stores";

import Plugin from "./plugin";
import { EVENT_DIMENSIONS_CHANGED, SYSTEM_EVENT_READY, SYSTEM_EVENT_ASSETS, EVENT_ON_FRAME, EVENT_SCREEN_CHANGED, EVENT_WORLD_CHANGED, SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED, EVENT_LOG_ENTRY, SYSTEM_EVENT_ADD_PLUGINS } from "./messages";
import { ipcRenderer } from "electron";
import { ON_PLUGIN_CONFIG_UPDATED, RELOAD_PLUGINS, ON_PLUGINS_ENABLED } from "common/ipc-handle-names";
import settingsStore from "@stores/settings-store";
import {
    installPlugin
} from "@ipc/plugins";
import Janitor from "@utils/janitor";
import waitForAssets from "../bootup/wait-for-assets";

ipcRenderer.on(ON_PLUGIN_CONFIG_UPDATED, (_, pluginId: string, config: any) => {
    _sendMessage({
        type: SYSTEM_EVENT_PLUGIN_CONFIG_CHANGED,
        pluginId,
        config
    })
});

ipcRenderer.on(ON_PLUGINS_ENABLED, (_, plugins: InitializedPluginPackage[]) => {
    _sendMessage({
        type: SYSTEM_EVENT_ADD_PLUGINS,
        plugins
    })
});



const _pluginSystems: PluginSystem[] = [];
class PluginSystem {
    #_iframe: HTMLIFrameElement = document.createElement("iframe");
    #_plugins: Plugin[] = [];
    #_janitor = new Janitor();

    static initializePlugin(pluginConfig: InitializedPluginPackage) {
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

    constructor(pluginPackages: InitializedPluginPackage[]) {
        this.#_iframe.style.backgroundColor = "transparent";
        this.#_iframe.style.border = "none";
        this.#_iframe.style.left = "0";
        this.#_iframe.style.top = "0";
        this.#_iframe.style.width = "100%";
        this.#_iframe.style.height = "100%";
        this.#_iframe.style.position = "absolute";
        this.#_iframe.style.zIndex = "10";
        this.#_iframe.style.pointerEvents = "none";
        this.#_iframe.style.userSelect = "none";
        this.#_iframe.sandbox.add("allow-scripts");
        this.#_iframe.sandbox.add("allow-downloads");

        this.#_plugins = pluginPackages.map(PluginSystem.initializePlugin).filter(plugin => plugin !== undefined) as Plugin[];

        this.#_plugins.forEach(plugin => {
            log.info(`@plugin-system: plugin initialized - "${plugin.name}" - ${plugin.version}`);
        });

        const initialStore = () => ({
            [EVENT_DIMENSIONS_CHANGED]: useGameStore.getState().dimensions,
            [EVENT_SCREEN_CHANGED]: screenChanged(useScreenStore.getState()).payload,
            [EVENT_WORLD_CHANGED]: useWorldStore.getState(),
            [EVENT_ON_FRAME]: _replayPosition.payload,
            [EVENT_LOG_ENTRY]: logChanged(useGameStore.getState()).payload
        })

        this.#_iframe.onload = async () => {
            this.#_iframe.contentWindow?.postMessage({
                type: SYSTEM_EVENT_READY,
                plugins: pluginPackages,
                initialStore: initialStore()
            }, "*")


            const assets = await waitForAssets();

            this.#_iframe.contentWindow?.postMessage({
                type: SYSTEM_EVENT_ASSETS,
                assets: {
                    ready: true,
                    bwDat: assets.bwDat,
                    gameIcons: assets.gameIcons,
                    cmdIcons: assets.cmdIcons,
                    raceInsetIcons: assets.raceInsetIcons,
                    workerIcons: assets.workerIcons,
                    wireframeIcons: assets.wireframeIcons,
                }
            }, "*")
        };
        document.body.appendChild(this.#_iframe);
        this.#_janitor.callback(() => document.body.removeChild(this.#_iframe));

        const _reload = () => {
            const settings = settingsStore().data;
            this.#_iframe.src = `http://localhost:${settings.plugins.serverPort}/runtime.html`;
        }
        ipcRenderer.on(RELOAD_PLUGINS, _reload);
        this.#_janitor.callback(() => ipcRenderer.off(RELOAD_PLUGINS, _reload));

        _reload();

    }

    addPlugin(plugin: Plugin) {
        this.#_plugins.push(plugin);
    }

    sendMessage(message: any) {
        this.#_iframe.contentWindow?.postMessage(message, "*");
    }
}

export const initializePluginSystem = async (pluginPackages: InitializedPluginPackage[]) => {
    _pluginSystems.push(new PluginSystem(pluginPackages));
}

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
        fps: "0",
        playerData: new Int32Array()
    }
}

export const hasOnFrame = (gameStatePosition: GameStatePosition) => {
    const time = gameStatePosition.getSecond();
    return _lastSend[EVENT_ON_FRAME] !== time;
}

export const onFrame = (gameStatePosition: GameStatePosition, fps: string, playerData: Int32Array) => {
    const time = gameStatePosition.getSecond();

    if (_lastSend[EVENT_ON_FRAME] !== time) {
        _lastSend[EVENT_ON_FRAME] = time;
        _replayPosition.payload.frame = gameStatePosition.bwGameFrame;
        _replayPosition.payload.maxFrame = gameStatePosition.maxFrame;
        _replayPosition.payload.time = gameStatePosition.getFriendlyTime();
        _replayPosition.payload.fps = fps;
        _replayPosition.payload.playerData = playerData;

        _sendMessage(_replayPosition);
    }
}

export const resetSendStates = () => {
    _lastSend = {};
}

const _sendMessage = (message: any) => {
    for (const pluginSystem of _pluginSystems) {
        pluginSystem.sendMessage(message);
    }
}

export const installPluginLocal = async (repository: string) => {
    const pluginPackage = await installPlugin(repository);
    if (pluginPackage) {
        const plugin = PluginSystem.initializePlugin(pluginPackage);
        if (plugin) {
            //TODO: default is always zero?
            if (_pluginSystems.length) {
                _pluginSystems[0].addPlugin(plugin);
            }
            return pluginPackage;
        } else {
            return null
        }
    } else {
        return null;
    }
}