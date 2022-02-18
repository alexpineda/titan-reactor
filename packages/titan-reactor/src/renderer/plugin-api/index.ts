import { Plugin } from "../../common/types";
import * as log from "../ipc/log";
import DefaultPluginAPI from "./default-plugin-api";
import settingsStore from "../stores/settings-store";
import { GameStatePosition, Unit } from "../core";
import { Scene } from "../render";

export const initializePlugins = (plugins: Plugin[]) => {

    for (const plugin of plugins) {
        try {
            if (plugin.import) {
                plugin.api = Function(plugin.import)();
                plugin.import = undefined;
            } else {
                plugin.api = new DefaultPluginAPI();
            }
            plugin.api.onInitialized(plugin.config, plugin.userConfig);

        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`plugin:initialize "${plugin.name}" - ${e.message}`);
            }
        }
    }
}

export const disposePlugins = (plugins: Plugin[]) => {
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