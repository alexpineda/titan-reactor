import { PluginInstance } from "../../common/types";
import * as log from "../ipc/log";
import GameAccessPlugin from "./game-access-plugin";
import settingsStore from "../stores/settings-store";
import pluginLayoutStore from "../stores/plugin-layout-store";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";

export const initializePlugins = (plugins: PluginInstance[]) => {

    for (const plugin of plugins) {
        try {
            if (plugin.import) {
                plugin.api = Function(plugin.import)();
                plugin.import = undefined;
            } else {
                plugin.api = new GameAccessPlugin();
            }
            plugin.api.onInitialized(plugin.config, plugin.userConfig, (size) => {
                pluginLayoutStore().updatePlugin(plugin, size);
            });

        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`plugin:initialize "${plugin.name}" - ${e.message}`);
            }
        }
    }
}

export const disposePlugins = (plugins: PluginInstance[]) => {
    for (const plugin of plugins) {
        try {
            plugin.api.onDispose && plugin.api.onDispose();
        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`plugin:dispose "${plugin.name}" - ${e.message}`);
            }
        }
    }
}

export const onFrame = (gameStatePosition: GameStatePosition, scene: Scene, cmdsThisFrame: any[], units: Map<number, Unit>) => {
    for (const plugin of settingsStore().plugins) {
        plugin.api.onFrame(gameStatePosition, scene, cmdsThisFrame, units);
    }
}