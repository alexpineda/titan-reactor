import * as log from "@ipc/log";
import { InitializedPluginPackage } from "common/types";
import * as THREE from "three";
import * as stores from "@stores"
import withErrorMessage from "common/utils/with-error-message";

type HookOptions = {
    postFn?: Function;
    synchronous?: boolean;
    hookAuthorPluginId?: string
}

type HookListener = {
    pluginId: string;
    pluginName: string;
    fn: Function;
}
// plugins may register their own custom hooks
class Hook {
    readonly args: string[];
    readonly name: string;
    protected listeners: HookListener[] = [];
    protected opts: HookOptions;

    constructor(name: string, args: string[], opts: HookOptions = {}) {
        this.name = name;
        this.args = args;
        this.opts = opts;
    }

    hasListeners() {
        return this.listeners.length > 0;
    }

    addListener(listener: HookListener) {
        this.listeners.push(listener);
    }

    removeListener(fn: Function) {
        this.listeners = this.listeners.filter(listener => listener.fn !== fn);
    }

    call(...args: any[]) {
        for (const listener of this.listeners) {
            if (this.opts.hookAuthorPluginId === undefined || listener.pluginId !== this.opts.hookAuthorPluginId) {
                try {
                    listener.fn(...args);
                } catch (e) {
                    log.error(withErrorMessage(`Error with hook ${this.name}`, e));
                }
            }
        }
    }
}

const createDefaultHooks = () => ({
    onGameDisposed: new Hook("onGameDisposed", []),
    onGameReady: new Hook("onGameReady", []),
    onBeforeRender: new Hook("onBeforeRender", ["delta", "elapsed"], { synchronous: true }),
    onRender: new Hook("onRender", ["delta", "elapsed"], { synchronous: true }),
    onTerrainGenerated: new Hook("onTerrainGenerated", ["scene", "terrain", "mapWidth", "mapHeight"]),
    onUnitCreated: new Hook("onUnitCreated", ["unit"]),
    onUnitKilled: new Hook("onUnitKilled", ["unit"]),
});

const defaultHookNamesArray = Object.keys(createDefaultHooks());

export class PluginSystemNative {
    #plugins: any[] = [];
    readonly hooks: Record<string, Hook> = createDefaultHooks();

    static initializePlugin(pluginPackage: InitializedPluginPackage) {

        try {
            if (!pluginPackage.nativeSource) {
                throw new Error("No native source provided");
            }
            const plugin = Function(pluginPackage.nativeSource!)();
            pluginPackage.nativeSource = undefined;

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

        this.#plugins.forEach(plugin => this.#registerDefaultHooks(plugin));
    }

    #registerDefaultHooks(plugin: any) {
        for (const hookName of defaultHookNamesArray) {
            if (typeof plugin[hookName] === "function") {
                this.hooks[hookName].addListener({
                    pluginId: plugin.id,
                    pluginName: plugin.name,
                    fn: plugin[hookName]
                });
            }
        }
    }

    #unregisterAllHooks(plugin: any) {
        for (const hookName of Object.keys(this.hooks)) {
            if (typeof plugin[hookName] === "function") {
                this.hooks[hookName].removeListener(
                    plugin[hookName]
                );
            }
        }
    }

    createCustomHook() {

    }

    destroyCustomHook() {

    }

    // master hook
    onDisable(pluginId: string) {
        const plugin = this.#plugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.onDisable && plugin.onDisable();
                this.#unregisterAllHooks(plugin);
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
            }
            this.#plugins = this.#plugins.filter(p => p !== plugin);
        }
    }

    // master hook
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

    enableAdditionalPlugins(pluginPackages: InitializedPluginPackage[]) {
        const additionalPlugins = pluginPackages.filter(p => Boolean(p.nativeSource)).map(PluginSystemNative.initializePlugin).filter(Boolean);

        this.#plugins = [...this.#plugins, ...additionalPlugins];
    }

    //callHookSync
    callHook(hookName: string, ...args: any[]) {
        if (this.hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        if (this.hooks[hookName].args.length !== args.length) {
            log.warning(`@plugin-system-native: hook "${hookName}" expects ${this.hooks[hookName].args.length} arguments, but got ${args.length}`);
        }

        return this.hooks[hookName].call(...args);

    }
}