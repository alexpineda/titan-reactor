import { InitializedPluginConfiguration } from "../../common/types";
import * as log from "../ipc/log";
import { GameStatePosition } from "../core";
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
        log.warning("plugins already initialized");
        return;
    }
    pluginsInitialized = true;
    _plugins = initializePlugins(settings.pluginsConfigs);

    for (const plugin of _plugins) {
        log.info(`@plugin-system: plugin initialized - "${plugin.name}" - ${plugin.version} - ${plugin.enabled}`);
    }
});

export const getPlugins = (all?: boolean) => _plugins.filter(p => all ?? p.enabled);

export const getWorkerChannels = () => getPlugins().flatMap(p => p.channels.filter(channel => channel instanceof PluginWorkerChannel) as PluginWorkerChannel[]);

export const getIFrameChannels = () => getPlugins().flatMap(p => p.channels.filter(channel => channel instanceof PluginIFrameChannel) as PluginIFrameChannel[]);

export const getHTMLChannels = () => getPlugins().flatMap(p => p.channels.filter(channel => channel instanceof PluginHTMLChannel) as PluginHTMLChannel[]);

export const getSlots = () => settingsStore().pluginSystemConfig.slots;

export const initializePlugins = (pluginConfigs: InitializedPluginConfiguration[]) => {

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
                log.error(`@plugin-system: failed to initialize "${pluginConfig.name}" - ${e.message}`);
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
                log.error(`@plugin-system: error disposing "${plugin.name}" - ${e.message}`);
            }
        }
    }
}

export const onFrame = (gameStatePosition: GameStatePosition) => {
    for (const plugin of _plugins) {
        plugin.onFrame(gameStatePosition);
    }
}