import { PluginMetaData, NativePlugin, PluginPackage, SceneInputHandler } from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { PluginSystemUI } from "./plugin-system-ui";
import { UI_SYSTEM_CUSTOM_MESSAGE } from "./events";
import { Hook, createDefaultHooks } from "./hooks";
import { PERMISSION_REPLAY_COMMANDS, PERMISSION_REPLAY_FILE } from "./permissions";
import throttle from "lodash.throttle";
import { Janitor } from "three-janitor";
import { savePluginsConfig } from "@ipc/plugins";
import { createCompartment } from "@utils/ses-util";
import { mix } from "@utils/object-utils";
import { log } from "@ipc/log"
import { normalizePluginConfiguration } from "@utils/function-utils"
import { GameTimeApi } from "@core/world/game-time-api";
import { GameViewPort } from "../camera/game-viewport";

export interface PluginBase extends NativePlugin, GameTimeApi { };
export class PluginBase implements NativePlugin {
    readonly id: string;
    readonly name: string;
    isSceneController = false;
    #config: any = {}

    /**
     * @internal
     * Same as config but simplified to [key] = value | [key] = value * factor
     */
    #normalizedConfig: any;

    constructor(pluginPackage: PluginPackage) {
        this.id = pluginPackage.id;
        this.name = pluginPackage.name;
        this.config = pluginPackage.config;
    }

    callCustomHook: (hook: string, ...args: any[]) => any = () => { };
    sendUIMessage: (message: any) => void = () => { };

    /**
     * 
     * @param key The configuration key.
     * @param value  The configuration value.
     * @returns 
     */
    setConfig(key: string, value: any, persist = true): void {
        if (!(key in this.#config)) {
            log.warning(`Plugin ${this.id} tried to set config key ${key} but it was not found`);
            return undefined;
        }

        this.#config[key].value = value;
        if (persist) {
            savePluginsConfig(this.id, this.#config);
        }
    }

    /*
    * Generates the normalized config object.
    * Same as config but simplified to [key] = value | [key] = value * factor
    */
    refreshConfig() {
        this.#normalizedConfig = normalizePluginConfiguration(this.#config);
    }

    /**
     * Read from the normalized configuration.
     */
    get config() {
        return this.#normalizedConfig;
    }

    /**
     * Set the config from unnormalized data (ie leva config schema).
     */
    set config(value: any) {
        this.#config = value;
        this.refreshConfig();
    }

    /**
     * @param key The configuration key.
     * @returns the leva configuration for a particular field
     */
    getRawConfigComponent(key: string) {
        return this.#config[key];
    }

    get rawConfig() {
        return this.#config;
    }
};

export interface SceneController extends PluginBase, SceneInputHandler {
    viewports: GameViewPort[];
};

export class SceneController extends PluginBase {
    override isSceneController = true;
    viewports: GameViewPort[] = [];
    override get viewport() {
        return this.viewports[0];
    }
    override get secondViewport() {
        return this.viewports[1];
    }
}

const VALID_PERMISSIONS = [
    PERMISSION_REPLAY_COMMANDS,
    PERMISSION_REPLAY_FILE
];

export class PluginSystemNative {
    #nativePlugins: PluginBase[] = [];
    #uiPlugins: PluginSystemUI;
    #janitor = new Janitor("PluginSystemNative");
    #sceneController?: SceneInputHandler;

    #hooks: Record<string, Hook> = createDefaultHooks();
    #permissions: Map<string, Record<string, boolean>> = new Map();
    externalHookListener: (hookName: string, pluginName?: string, ...context: any[]) => void = () => { }

    [Symbol.iterator]() {
        return this.#nativePlugins[Symbol.iterator]();
    }

    get reduce() {
        return this.#nativePlugins.reduce.bind(this.#nativePlugins);
    }

    initializePlugin(pluginPackage: PluginMetaData) {

        const c = createCompartment({
            PluginBase, SceneController
        });

        try {
            // temporary object container returned from the plugin
            let plugin = new PluginBase(pluginPackage);

            if (pluginPackage.nativeSource) {
                if (pluginPackage.nativeSource.includes("export default")) {
                    const Constructor = c.globalThis.Function(pluginPackage.nativeSource.replace("export default", "return"))();
                    plugin = new Constructor(pluginPackage);
                } else {
                    plugin = Object.assign(plugin, c.globalThis.Function(pluginPackage.nativeSource)()) as PluginBase
                }
            }

            plugin.isSceneController = pluginPackage.isSceneController;

            const permissions = (pluginPackage.config?.system?.permissions ?? []).reduce((acc: Record<string, boolean>, permission: string) => {
                if (VALID_PERMISSIONS.includes(permission)) {
                    acc[permission] = true;
                } else {
                    log.warning(`Invalid permission ${permission} for plugin ${pluginPackage.name}`);
                }
                return acc;
            }, {});

            this.#permissions.set(pluginPackage.id, permissions);

            for (const hook of pluginPackage.hooks) {
                this.#registerCustomHook(hook, [], pluginPackage.id, false);
            }

            plugin.sendUIMessage = throttle((message: any) => {
                this.#sendCustomUIMessage(plugin, message);
            }, 100, { leading: true, trailing: false });

            plugin.callCustomHook = (name: string, ...args: any[]) => {
                if (this.#hooks[name] === undefined) {
                    log.warning(`Plugin ${pluginPackage.name} tried to call hook ${name} but it was not found`);
                }
                else if (!this.#hooks[name].isAuthor(pluginPackage.id)) {
                    log.warning(`Plugin ${pluginPackage.name} tried to call hook ${name} but it is not the author`);
                } else if (this.#hooks[name].isAuthor(pluginPackage.id)) {
                    return this.callHook(name, ...args);
                }
            };
            log.verbose(`@plugin-system-native: initialized plugin "${plugin.name}"`);

            return plugin;
        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`@plugin-system: failed to initialize "${pluginPackage.name}" - ${e.message}`);
            }
        }

    };

    constructor(pluginPackages: PluginMetaData[], uiPlugins: PluginSystemUI) {

        this.#hooks = createDefaultHooks();
        this.#nativePlugins = pluginPackages.map(p => this.initializePlugin(p)).filter(Boolean) as PluginBase[];
        this.#uiPlugins = uiPlugins;

        const _messageListener = (event: MessageEvent) => {
            if (event.data.type === UI_SYSTEM_CUSTOM_MESSAGE) {
                const { pluginId, message } = event.data.payload;
                this.#hook_onUIMessage(pluginId, message);
            }
        };
        window.addEventListener("message", _messageListener);
        this.#janitor.mop(() => { window.removeEventListener("message", _messageListener); }, "messageListener");

    }

    getSceneInputHandlers() {
        return this.#nativePlugins.filter(p => p.isSceneController) as SceneController[];
    }

    activateSceneController(plugin: SceneController | undefined) {
        this.#sceneController = plugin;
        if (plugin) {
            this.externalHookListener("onEnterScene", plugin.name);
        }
    }

    getById(id: string) {
        return this.#nativePlugins.find(p => p.id === id);
    }

    getByName(name: string) {
        return this.#nativePlugins.find(p => p.name === name);
    }

    #registerCustomHook(name: string, args: string[], hookAuthorPluginId: string, async: boolean = false) {
        if (this.#hooks[name] !== undefined) {
            log.error(`@plugin-system: hook ${name} already registered`);
            return;
        }

        if (!name.startsWith("onCustom")) {
            log.error(`@plugin-system: hook ${name} must start with "onCustom"`);
            return;
        }

        this.#hooks[name] = new Hook(name, args, { async, hookAuthorPluginId });
    }

    #sendCustomUIMessage(plugin: PluginBase, message: any) {
        if (this.#nativePlugins.includes(plugin)) {
            this.#uiPlugins.sendMessage({
                type: UI_SYSTEM_CUSTOM_MESSAGE,
                payload: {
                    pluginId: plugin.id,
                    message
                }
            });
        }
    }

    #hook_onUIMessage(pluginId: string, message: any) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.onUIMessage && plugin.onUIMessage(message);
            } catch (e) {
                log.error(withErrorMessage(e, `@plugin-system-native: onUIMessage "${plugin.name}"`));
            }
        }
    }

    dispose() {
        for (const plugin of this.#nativePlugins) {
            try {
                this.hook_onPluginDispose(plugin.id);
            } catch (e) {
                log.error(withErrorMessage(e, `@plugin-system-native: onDispose "${plugin.name}"`));
            }
        }
        this.#hooks = {};
        this.#nativePlugins = [];
    }

    hook_onPluginDispose(pluginId: string) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.dispose && plugin.dispose();
            } catch (e) {
                log.error(withErrorMessage(e, `@plugin-system-native: onDispose "${plugin.name}"`));
            }
            this.#nativePlugins = this.#nativePlugins.filter(p => p !== plugin);

            for (const key of Object.keys(this.#hooks)) {
                if (this.#hooks[key].isAuthor(pluginId)) {
                    delete this.#hooks[key];
                }
            }
        }
    }

    isRegularPluginOrActiveSceneController(plugin: NativePlugin) {

        return !plugin.isSceneController || this.#sceneController === plugin;

    }

    hook_onConfigChanged(pluginId: string, config: any) {

        const plugin = this.#nativePlugins.find(p => p.id === pluginId);

        if (plugin) {
            try {
                const oldConfig = { ...plugin.config };
                plugin.config = config;
                plugin.onConfigChanged && this.isRegularPluginOrActiveSceneController(plugin) && plugin.onConfigChanged(oldConfig);
            } catch (e) {
                log.error(withErrorMessage(e, `@plugin-system-native: onConfigChanged "${plugin.name}"`));
            }
        }

    }

    hook_onBeforeRender(delta: number, elapsed: number) {

        for (const plugin of this.#nativePlugins) {
            plugin.onBeforeRender && this.isRegularPluginOrActiveSceneController(plugin) && plugin.onBeforeRender(delta, elapsed);
        }

    }

    hook_onRender(delta: number, elapsed: number) {

        for (const plugin of this.#nativePlugins) {
            plugin.onRender && plugin.onRender(delta, elapsed);
        }

    }

    hook_onFrame(frame: number, commands: any[]) {

        for (const plugin of this.#nativePlugins) {
            if (plugin.onFrame && this.isRegularPluginOrActiveSceneController(plugin)) {
                if (this.#permissions.get(plugin.id)?.[PERMISSION_REPLAY_COMMANDS]) {
                    plugin.onFrame(frame, commands);
                } else {
                    plugin.onFrame(frame)
                }
            }
        }

    }

    enableAdditionalPlugins(pluginPackages: PluginMetaData[]) {

        const additionalPlugins = pluginPackages.map(p => this.initializePlugin(p)).filter(Boolean);

        this.#nativePlugins = [...this.#nativePlugins, ...additionalPlugins] as PluginBase[];
    }

    /**
     * Temporarily inject an api into all active plugins.
     */
    injectApi(object: {}) {

        mix(PluginBase.prototype, object);
        const keys = Object.keys(object);

        return () => {
            keys.forEach(key => {
                delete PluginBase.prototype[key as keyof typeof PluginBase.prototype];
            })
        }

    }

    callHook(hookName: string, ...args: any[]) {

        if (this.#hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        let context;
        for (const plugin of this.#nativePlugins) {
            if (!this.#hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined && this.isRegularPluginOrActiveSceneController(plugin)) {
                plugin.context = context;
                context = plugin[hookName as keyof typeof plugin].apply(plugin, args) ?? context;
                this.externalHookListener(hookName, plugin.name, args, context);
                delete plugin.context;
            }
        }
        this.externalHookListener(hookName, undefined, args, context);
        return context;
    }

    async callHookAsync(hookName: string, ...args: any[]) {

        if (this.#hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        let context;
        for (const plugin of this.#nativePlugins) {
            if (!this.#hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined && this.isRegularPluginOrActiveSceneController(plugin)) {
                plugin.context = context;
                context = await plugin[hookName as keyof typeof plugin].apply(plugin, args) ?? context;
                this.externalHookListener(hookName, plugin.name, args, context);
                delete plugin.context;
            }
        }
        this.externalHookListener(hookName, undefined, args, context);
        return context;

    }

}