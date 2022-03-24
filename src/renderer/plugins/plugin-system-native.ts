import * as log from "@ipc/log";
import assert from "assert";
import { InitializedPluginPackage } from "common/types";
import * as THREE from "three";

export class PluginSystemNative {
    static initializePlugin(pluginConfig: InitializedPluginPackage) {
        let plugin;

        try {
            if (!pluginConfig.nativeSource) {
                throw new Error("No native source provided");
            }
            plugin = Function(pluginConfig.nativeSource!)();
            pluginConfig.nativeSource = undefined;

            assert(plugin.onInitialized, "onInitialized is required");
            assert(plugin.onFrame, "onFrame is required");

            plugin.onInitialized(pluginConfig, THREE);

        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`@plugin-system: failed to initialize "${pluginConfig.name}" - ${e.message}`);
            }
        }
        return plugin;
    };
}