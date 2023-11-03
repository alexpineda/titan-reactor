import {
    PluginMetaData,
    FieldDefinition,
    PluginConfig,
} from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { UI_SYSTEM_CUSTOM_MESSAGE } from "./events";
import throttle from "lodash.throttle";
import { Janitor } from "three-janitor";
import { mix } from "@utils/object-utils";
import { log } from "@ipc/log";
import { PluginBase } from "./plugin-base";
import { SceneController } from "./scene-controller";
import lSet from "lodash.set";
import { urlJoin } from "@utils/string-utils";

type PluginsConfigSnapshot = Record<
    string,
    Record<string, number | boolean | string | number[]>
>;

/**
 * Native plugin manager for plugins that can access game state and onFrame hooks etc.
 */
export class PluginSystemNative {
    #plugins: PluginBase[] = [];
    #janitor = new Janitor("PluginSystemNative");
    #sceneController?: SceneController;

    #sendCustomUIMessage!: (pluginId: string, message: any) => void;
    #compartments = new WeakMap<PluginBase, { globalThis: object }>();

    /**
     * Error trapping is signficantly slower than not using it.
     * This is enabled when the debug setting is enabled to aid in debugging plugin hooks like onFrame.
     */
    useTryCatchOnHooks = false;

    [Symbol.iterator]() {
        return this.#plugins[Symbol.iterator]();
    }

    get reduce() {
        return this.#plugins.reduce.bind(this.#plugins);
    }

    async activatePlugin(
        pluginPackage: PluginMetaData,
        createCompartment: (env: unknown) => {
            globalThis: {
                Function: (...args: any[]) => () => object | PluginBase;
            };
        }
    ) {

        
        const compartment = createCompartment({
            PluginBase,
            SceneController,
        });

        try {
            const Plugin = await import( urlJoin(pluginPackage.url, "host.js"));

            if (!Plugin) {
                throw new Error("Plugin constructor must extend PluginBase");
            }

            const plugin = new Plugin.default(pluginPackage);

            plugin.isSceneController = pluginPackage.isSceneController;

            plugin.sendUIMessage = throttle(
                (message: any) => {
                    this.#sendCustomUIMessage(plugin.id, message);
                },
                100,
                { leading: true, trailing: false }
            );

            log.debug(`@plugin-system-native: activated plugin "${plugin.name}" - ${plugin.isSceneController ? "scene controller" : "regular"}`);

            this.#compartments.set(plugin, compartment);

            return plugin;
        } catch (e: unknown) {
            log.error(
                withErrorMessage(
                    e,
                    `@plugin-system: failed to initialize "${pluginPackage.name}"`
                )
            );
        }
    }

    async init(
        pluginPackages: PluginMetaData[],
        msg: (id: string, message: any) => void,
        createCompartment: (env: any) => any
    ) {

        log.debug(`@plugin-system-native: init`);
        for (const pkg of pluginPackages) {
            const plugin = await this.activatePlugin(pkg, createCompartment);
            if (plugin) {
                this.#plugins.push(plugin);
            }
        }
        this.#sendCustomUIMessage = msg;

        this.#janitor.addEventListener(
            window,
            "message",
            "messageListener",
            (event: {
                data?: {
                    type?: string;
                    payload?: { pluginId: string; message: string };
                };
            }) => {
                if (event.data?.type === UI_SYSTEM_CUSTOM_MESSAGE) {
                    const { pluginId, message } = event.data.payload!;
                    const plugin = this.#plugins.find((p) => p.id === pluginId);
                    if (plugin) {
                        try {
                            plugin.onUIMessage && plugin.onUIMessage(message);
                        } catch (e) {
                            log.error(
                                withErrorMessage(
                                    e,
                                    `@plugin-system-native: onUIMessage "${plugin.name}"`
                                )
                            );
                        }
                    }
                }
            }
        );
    }

    getAllSceneControllers() {
        console.log("getAllSceneControllers", this.#plugins)
        return this.#plugins.filter((p) => p.isSceneController) as SceneController[];
    }

    activateSceneController(plugin: SceneController | undefined) {
        this.#sceneController = plugin;
    }

    getByName(name: string) {
        return this.#plugins.find((p) => p.name === name);
    }

    dispose() {
        for (const plugin of this.#plugins) {
            try {
                plugin.dispose && plugin.dispose();
            } catch (e) {
                log.error(
                    withErrorMessage(
                        e,
                        `@plugin-system-native: onDispose "${plugin.name}"`
                    )
                );
            }
        }
        this.#plugins = [];
    }

    deactivatePlugin(id: string) {
        const plugin = this.#plugins.find((p) => p.id === id);
        if (plugin) {
            try {
                plugin.dispose && plugin.dispose();
            } catch (e) {
                log.error(
                    withErrorMessage(
                        e,
                        `@plugin-system-native: onDispose "${plugin.name}"`
                    )
                );
            }
            this.#plugins = this.#plugins.filter((p) => p.id !== id);
        }
    }

    isRegularPluginOrActiveSceneController(plugin: PluginBase) {
        return !plugin.isSceneController || this.#sceneController === plugin;
    }

    hook_onConfigChanged(pluginId: string, config: PluginConfig) {
        const plugin = this.#plugins.find((p) => p.id === pluginId);

        if (plugin) {
            try {
                const oldConfig = { ...plugin.config };
                plugin.rawConfig = config;
                plugin.onConfigChanged &&
                    this.isRegularPluginOrActiveSceneController(plugin) &&
                    plugin.onConfigChanged(oldConfig);
            } catch (e) {
                log.error(
                    withErrorMessage(
                        e,
                        `@plugin-system-native: onConfigChanged "${plugin.name}"`
                    )
                );
            }
        }
    }

    #hook_onFrame(frame: number, commands: any[]) {
        for (const plugin of this.#plugins) {
            if (plugin.onFrame && this.isRegularPluginOrActiveSceneController(plugin)) {
                plugin.onFrame(frame, commands);
            }
        }
    }

    hook_onFrame(frame: number, commands: any[]) {
        if (this.useTryCatchOnHooks) {
            try {
                this.#hook_onFrame(frame, commands);
            } catch (e) {
                log.error(withErrorMessage(e, "@plugin-system-native: onFrame"));
            }
        } else {
            this.#hook_onFrame(frame, commands);
        }
    }

    activateAdditionalPlugins(
        pluginPackages: PluginMetaData[],
        createCompartment: (env: any) => any
    ) {
        const additionalPlugins = pluginPackages
            .map((p) => this.activatePlugin(p, createCompartment))
            .filter(Boolean);

        this.#plugins = [...this.#plugins, ...additionalPlugins] as PluginBase[];
    }

    /**
     * Temporarily inject an api into all active plugins.
     */
    injectApi(object: object) {
        mix(PluginBase.prototype, object);
        const keys = Object.keys(object);

        return () => {
            keys.forEach((key) => {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete PluginBase.prototype[key as keyof typeof PluginBase.prototype];
            });
        };
    }

    getConfigSnapshot() {
        return this.#plugins.reduce((acc, plugin) => {
            for (const [key, field] of Object.entries(plugin.rawConfig ?? {})) {
                if (
                    key !== "system" &&
                    (field as FieldDefinition).value !== undefined
                ) {
                    lSet(acc, [plugin.name, key], (field as FieldDefinition).value);
                }
            }
            return acc;
        }, {}) as PluginsConfigSnapshot;
    }

    sessionInit() {
        for (const plugin of this.#plugins) {
            try {
                log.debug(`init plugin ${plugin.name} ${!!plugin.init}`);
                plugin.init && plugin.init();
            } catch (e) {
                this.deactivatePlugin(plugin.id);
                log.error(
                    withErrorMessage(e, `@plugin-system-native: init "${plugin.name}"`)
                );
            }
        }
    }
}
