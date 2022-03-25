import * as log from "@ipc/log";
import assert from "assert";
import { InitializedPluginPackage } from "common/types";
import * as THREE from "three";
import * as stores from "@stores"
import { Scene } from "../render";
import { Mesh } from "three";
import withErrorMessage from "common/utils/with-error-message";

export class PluginSystemNative {
    #plugins: any[] = [];

    static initializePlugin(pluginPackage: InitializedPluginPackage) {

        try {
            if (!pluginPackage.nativeSource) {
                throw new Error("No native source provided");
            }
            const plugin = Function(pluginPackage.nativeSource!)();
            pluginPackage.nativeSource = undefined;

            assert(plugin.onInitialized, "onInitialized is required");

            plugin.onInitialized(pluginPackage.config, { THREE, stores });
            plugin.id = pluginPackage.id;
            plugin.name = pluginPackage.name;

            return plugin;
        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`@plugin-system: failed to initialize "${pluginPackage.name}" - ${e.message}`);
            }
        }
    };

    constructor(pluginPackages: InitializedPluginPackage[]) {
        this.#plugins = pluginPackages.filter(p => Boolean(p.nativeSource)).map(PluginSystemNative.initializePlugin).filter(Boolean);
    }

    onDispose(pluginId: string) {
        const plugin = this.#plugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.onDispose && plugin.onDispose();
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
            }
            this.#plugins = this.#plugins.filter(p => p !== plugin);
        }
    }

    onConfigChanged(pluginId: string, config: any) {
        const plugin = this.#plugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.onConfigChanged && plugin.onConfigChanged(config);
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onConfigChanged "${plugin.name}"`, e));
            }
        }
    }

    onPluginsEnabled(pluginPackages: InitializedPluginPackage[]) {
        this.#plugins = [...this.#plugins, ...pluginPackages.filter(p => Boolean(p.nativeSource)).map(PluginSystemNative.initializePlugin).filter(Boolean)];
    }

    onGameDisposed() {
        this.#plugins.forEach(plugin => {
            try {
                plugin.onGameDisposed && plugin.onGameDisposed()
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onGameDisposed "${plugin.name}"`, e));
            }
        });
    }

    onGameReady() {
        this.#plugins.forEach(plugin => {
            try {
                plugin.onGameReady && plugin.onGameReady();
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onGameReady "${plugin.name}"`, e));
            }
        });
    }

    onTerrainGenerated(scene: Scene, terrain: Mesh, mapWidth: number, mapHeight: number) {
        this.#plugins.forEach(plugin => {
            try {
                plugin.onTerrainGenerated && plugin.onTerrainGenerated(scene, terrain, mapWidth, mapHeight)
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onTerrainGenerated "${plugin.name}"`, e));
            }
        });
    }
}