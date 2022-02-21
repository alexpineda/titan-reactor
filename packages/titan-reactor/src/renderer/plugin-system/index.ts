import { HTMLPluginConfig, IFramePluginConfig, InitializedPluginJSON, WorkerPluginConfig } from "../../common/types";
import * as log from "../ipc/log";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";
import { useSettingsStore } from "../stores";
import assert from "assert";
import Plugin from "./plugin";
import PluginWorkerChannel from "./channel/worker-channel";
import PluginIFrameChannel from "./channel/iframe-channel";
import settingsStore from "../stores/settings-store";
import PluginHTMLChannel from "./channel/html-channel";

let _plugins: Plugin[] = [];
let pluginsInitialized = false;

useSettingsStore.subscribe((settings) => {
    if (_plugins && pluginsInitialized) {
        console.warn("plugins already initialized");
        return;
    }
    pluginsInitialized = true;
    _plugins = initializePlugins(settings.pluginsConfigs);
});

export const getPlugins = () => [..._plugins];

export const getWorkerChannels = () => _plugins.flatMap(p => p.channels.filter(channel => channel instanceof PluginWorkerChannel)) as PluginWorkerChannel[];

export const getIFrameChannels = () => _plugins.flatMap(p => p.channels.filter(channel => channel instanceof PluginIFrameChannel)) as PluginIFrameChannel[];

export const getHTMLChannels = () => _plugins.flatMap(p => p.channels.filter(channel => channel instanceof PluginIFrameChannel)) as PluginHTMLChannel[];

export const getSlots = () => settingsStore().pluginSystemConfig.slots;

export const initializePlugins = (pluginConfigs: InitializedPluginJSON[]) => {

    const plugins = pluginConfigs.map(pluginConfig => {
        let plugin;

        try {
            if (pluginConfig.native) {
                if (pluginConfig.native === "isolated") {
                    plugin = (Function(pluginConfig.nativeSource!)());
                } else {
                    plugin = Object.create(Plugin, Function(pluginConfig.nativeSource!)());
                }
                pluginConfig.native = undefined;
                assert(plugin.onInitialized, "onInitialized is required");
                assert(plugin.onFrame, "onFrame is required");
                plugin.onInitialized(pluginConfig);
            } else {
                plugin = new Plugin(pluginConfig);
            }

        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`plugin:initialize "${pluginConfig.name}" - ${e.message}`);
            }
        }
        return plugin;
    }).filter(plugin => plugin !== undefined) as Plugin[];

    return plugins;
}

export const disposePlugins = (plugins: Plugin[]) => {
    for (const plugin of plugins) {
        try {
            plugin.onDispose && plugin.onDispose();
        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`plugin:dispose "${plugin.name}" - ${e.message}`);
            }
        }
    }
}

export const onFrame = (gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>) => {
    for (const plugin of _plugins) {
        plugin.onFrame(gameStatePosition, scene, cmdsThisFrame, units);
    }
}


export const isIFrameChannelConfig = (channel: any): channel is IFramePluginConfig => {
    return channel.type === "iframe";
}

export const isHTMLChannelConfig = (channel: any): channel is HTMLPluginConfig => {
    return channel.type === "html";
}

export const isWorkerChannelConfig = (channel: any): channel is WorkerPluginConfig => {
    return channel.type === "html";
}