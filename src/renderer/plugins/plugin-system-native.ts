import { SceneInputHandler, PluginMetaData, NativePlugin, PluginPrototype, MacroActionPlugin, MacroActionEffect } from "common/types";
import withErrorMessage from "common/utils/with-error-message";
import { PluginSystemUI } from "./plugin-system-ui";
import { UI_SYSTEM_CUSTOM_MESSAGE } from "./events";
import { Hook, createDefaultHooks } from "./hooks";
import { PERMISSION_REPLAY_COMMANDS, PERMISSION_REPLAY_FILE } from "./permissions";
import throttle from "lodash.throttle";
import Janitor from "@utils/janitor";
import { getMacroActionValue, Macro, Macros } from "@macros";
import { updatePluginsConfig } from "@ipc/plugins";
import { createCompartment } from "@utils/ses-util";
import { mix } from "@utils/object-utils";
import * as log from "@ipc/log";

const pluginProto: PluginPrototype = {
    id: "",
    $$permissions: {},
    $$config: {},

    setConfig(key: string, value: any, persist = true) {
        if (!(key in this.$$config)) {
            log.warning(`Plugin ${this.id} tried to set config key ${key} but it was not found`);
            return undefined;
        }

        // TODO: use leva detection algo here to determine if values are in bounds

        this.$$config[key].value = value;

        if (persist) {
            updatePluginsConfig(this.id, this.$$config);
        }
    }
};

function processConfigBeforeReceive(config: any) {
    if (config) {
        const configCopy: any = {};
        Object.keys(config).forEach((key) => {
            if (config[key]?.value !== undefined) {
                if (config[key]?.factor !== undefined) {
                    configCopy[key] = config[key].value * config[key].factor;
                } else {
                    configCopy[key] = config[key].value;
                }
            }
        });
        return Object.freeze(configCopy);
    }
}

const VALID_PERMISSIONS = [
    PERMISSION_REPLAY_COMMANDS,
    PERMISSION_REPLAY_FILE
];

export class PluginSystemNative {
    #nativePlugins: NativePlugin[] = [];
    #uiPlugins: PluginSystemUI;
    #janitor = new Janitor;
    #activeSceneInputHandler?: SceneInputHandler;
    #macros: Macros | null = null;

    #hooks: Record<string, Hook> = createDefaultHooks();

    initializePlugin(pluginPackage: PluginMetaData) {

        try {
            const c = createCompartment();
            const pluginRaw = pluginPackage.nativeSource ? c.globalThis.Function(pluginPackage.nativeSource)() : {};

            //override but give a truthy value
            pluginPackage.nativeSource = "true";

            pluginRaw.id = pluginPackage.id;
            pluginRaw.name = pluginPackage.name;
            pluginRaw.$$meta = {
                methods: pluginPackage.methods,
                hooks: pluginPackage.hooks,
                hasUI: pluginPackage.hasUI,
                isSceneController: pluginPackage.isSceneController,
            }
            pluginRaw.$$config = pluginPackage.config;
            //FIXME: freeze config but allow us to edit for saving
            // possibly use a Weakmap instead of attaching to object
            pluginRaw.$$config = JSON.parse(JSON.stringify(pluginPackage.config));

            const permissions = (pluginPackage.config?.system?.permissions ?? []).reduce((acc: Record<string, boolean>, permission: string) => {
                if (VALID_PERMISSIONS.includes(permission)) {
                    acc[permission] = true;
                } else {
                    log.warning(`Invalid permission ${permission} for plugin ${pluginPackage.name}`);
                }
                return acc;
            }, {});
            pluginRaw.$$permissions = Object.freeze(permissions);

            const nonEditableKeys = ["id", "name", "$$permissions", "$$meta"];

            const pluginPropertyConfig: Record<string, {}> = {};
            for (const key in pluginRaw) {
                if (pluginRaw.hasOwnProperty(key)) {
                    const editable = nonEditableKeys.includes(key) ? false : true;
                    pluginPropertyConfig[key as keyof typeof pluginPropertyConfig] = {
                        configurable: editable,
                        enumerable: true,
                        writable: editable,
                        value: pluginRaw[key]
                    }
                }
            }

            const plugin = Object.create(pluginProto, pluginPropertyConfig);

            for (const hook of pluginPackage.hooks) {
                this.#registerCustomHook(hook, [], pluginPackage.id, false);
            }

            plugin.config = processConfigBeforeReceive(pluginPackage.config);

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
        this.#nativePlugins = pluginPackages.map(p => this.initializePlugin(p)).filter(Boolean);
        this.#uiPlugins = uiPlugins;

        const _messageListener = (event: MessageEvent) => {
            if (event.data.type === UI_SYSTEM_CUSTOM_MESSAGE) {
                const { pluginId, message } = event.data.payload;
                this.#hook_onUIMessage(pluginId, message);
            }
        };
        window.addEventListener("message", _messageListener);
        this.#janitor.add(() => { window.removeEventListener("message", _messageListener); });
    }

    getSceneInputHandlers() {
        return this.#nativePlugins.filter(p => p.$$meta.isSceneController) as SceneInputHandler[];
    }

    setActiveSceneInputHandler(plugin: SceneInputHandler) {
        this.#activeSceneInputHandler = plugin;
    }

    #getByName(name: string) {
        return this.#nativePlugins.find(p => p.name === name);
    }

    #getById(id: string) {
        return this.#nativePlugins.find(p => p.id === id);
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

    #sendCustomUIMessage(plugin: NativePlugin, message: any) {
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
                log.error(withErrorMessage(`@plugin-system-native: onUIMessage "${plugin.name}"`, e));
            }
        }
    }

    dispose() {
        for (const plugin of this.#nativePlugins) {
            try {
                this.hook_onPluginDispose(plugin.id);
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
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
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
            }
            this.#nativePlugins = this.#nativePlugins.filter(p => p !== plugin);

            for (const key of Object.keys(this.#hooks)) {
                if (this.#hooks[key].isAuthor(pluginId)) {
                    delete this.#hooks[key];
                }
            }
        }
    }

    #sceneInputHandlerGaurd(plugin: NativePlugin) {
        return !plugin.$$meta.isSceneController || this.#activeSceneInputHandler === plugin;
    }

    hook_onConfigChanged(pluginId: string, config: any) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                const oldConfig = { ...plugin.config };
                plugin.config = processConfigBeforeReceive(config);
                plugin.onConfigChanged && this.#sceneInputHandlerGaurd(plugin) && plugin.onConfigChanged(oldConfig);
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onConfigChanged "${plugin.name}"`, e));
            }
        }
    }

    hook_onBeforeRender(delta: number, elapsed: number) {
        for (const plugin of this.#nativePlugins) {
            plugin.onBeforeRender && this.#sceneInputHandlerGaurd(plugin) && plugin.onBeforeRender(delta, elapsed);
        }
    }

    hook_onRender(delta: number, elapsed: number) {
        for (const plugin of this.#nativePlugins) {
            plugin.onRender && plugin.onRender(delta, elapsed);
        }
    }

    hook_onFrame(frame: number, commands: any[]) {
        for (const plugin of this.#nativePlugins) {
            if (plugin.onFrame && this.#sceneInputHandlerGaurd(plugin)) {
                if (plugin.$$permissions[PERMISSION_REPLAY_COMMANDS]) {
                    plugin.onFrame(frame, commands);
                } else {
                    plugin.onFrame(frame)
                }
            }
        }
    }

    enableAdditionalPlugins(pluginPackages: PluginMetaData[]) {
        const additionalPlugins = pluginPackages.map(p => this.initializePlugin(p)).filter(Boolean);

        this.#nativePlugins = [...this.#nativePlugins, ...additionalPlugins];
    }

    /**
     * Temporarily inject an api into all active plugins.
     */
    injectApi(object: {}, macros: Macros) {
        mix(pluginProto, object);
        const keys = Object.keys(object);
        this.#macros = macros;

        return () => {
            this.#macros = null;
            keys.forEach(key => {
                delete pluginProto[key as keyof typeof pluginProto];
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
            if (!this.#hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined && this.#sceneInputHandlerGaurd(plugin)) {
                plugin.context = context;
                context = plugin[hookName as keyof typeof plugin].apply(plugin, args) ?? context;
                this.#macros && this.#macros.callHook(hookName, plugin.name, context);
                delete plugin.context;
            }
        }
        this.#macros && this.#macros.callHook(hookName, undefined, context);
        return context;
    }

    async callHookAsync(hookName: string, ...args: any[]) {
        if (this.#hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        let context;
        for (const plugin of this.#nativePlugins) {
            if (!this.#hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined && this.#sceneInputHandlerGaurd(plugin)) {
                plugin.context = context;
                context = await plugin[hookName as keyof typeof plugin].apply(plugin, args) ?? context;
                this.#macros && this.#macros.callHook(hookName, plugin.name, context);
                delete plugin.context;
            }
        }
        this.#macros && this.#macros.callHook(hookName, undefined, context);
        return context;
    }

    setAllMacroDefaults(macro: Macro) {
        for (const plugin of this.#nativePlugins) {
            macro.setPluginsDefaults(plugin.name, plugin.config);
        }
    }

    setMacroDefaults(macro: Macro, pluginId: string, config: any) {
        const plugin = this.#getById(pluginId);
        if (!plugin) {
            log.error(`Plugin ${pluginId} not found`);
            return;
        }
        macro.setPluginsDefaults(plugin.name, config);
    }

    doMacroAction(action: MacroActionPlugin) {
        const plugin = this.#getByName(action.pluginName!);
        if (!plugin) {
            log.error(`@macro-action: Plugin ${action.pluginName} not found`);
            return null;
        }

        if (action.effect === MacroActionEffect.CallMethod) {
            const key = action.field[0];
            if (typeof plugin[key as keyof NativePlugin] === "function") {
                try {
                    plugin[key as keyof NativePlugin]();
                } catch (e) {
                    log.error(withErrorMessage(`@macro-action: ${action.pluginName} ${key}`, e));
                }
            }
            return null;
        } else {
            const key = action.field[0];
            const field = plugin.$$config[key];
            if (field === undefined) {
                return null;
            }
            plugin.setConfig(key, getMacroActionValue(action, field.value, field.step, field.min, field.max, field.options), false);
            return {
                pluginId: plugin.id,
                config: plugin.$$config
            }
        }
    }

}