import { SceneInputHandler, InitializedPluginPackage, NativePlugin, PluginPrototype, MacroActionPlugin, MacroActionEffect } from "common/types";
import withErrorMessage from "common/utils/with-error-message";
import { PluginSystemUI } from "./plugin-system-ui";
import { UI_SYSTEM_CUSTOM_MESSAGE } from "./events";
import { HOOK_ON_FRAME_RESET, HOOK_ON_GAME_DISPOSE, HOOK_ON_GAME_READY, HOOK_ON_SCENE_PREPARED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED, HOOK_ON_UPGRADE_COMPLETED, HOOK_ON_TECH_COMPLETED, HOOK_ON_UNITS_SELECTED } from "./hooks";
import { PERMISSION_REPLAY_COMMANDS, PERMISSION_REPLAY_FILE } from "./permissions";
import throttle from "lodash.throttle";
import Janitor from "@utils/janitor";
import { getMacroActionValue, Macro } from "../command-center/macros";
import { updatePluginsConfig } from "@ipc/plugins";
import { createCompartment } from "@utils/ses-util";
import { mix } from "@utils/object-utils";
import * as log from "@ipc/log";

type InternalHookOptions = {
    postFn?: Function;
    async?: boolean;
    hookAuthorPluginId?: string
}

// plugins may register their own custom hooks
class Hook {
    readonly args: string[];
    readonly name: string;
    #opts: InternalHookOptions;

    constructor(name: string, args: string[], opts: InternalHookOptions = {}) {
        this.name = name;
        this.args = args;
        this.#opts = opts;
    }

    isAsync() {
        return this.#opts.async;
    }

    isAuthor(id: string) {
        return this.#opts.hookAuthorPluginId === id;
    }

}

const createDefaultHooks = () => ({
    [HOOK_ON_GAME_DISPOSE]: new Hook(HOOK_ON_GAME_DISPOSE, []),
    [HOOK_ON_GAME_READY]: new Hook(HOOK_ON_GAME_READY, [], { async: true }),
    [HOOK_ON_SCENE_PREPARED]: new Hook(HOOK_ON_SCENE_PREPARED, ["scene", "sceneUserData", "map", "replayHeader"]),
    [HOOK_ON_UNIT_CREATED]: new Hook(HOOK_ON_UNIT_CREATED, ["unit"]),
    [HOOK_ON_UNIT_KILLED]: new Hook(HOOK_ON_UNIT_KILLED, ["unit"]),
    [HOOK_ON_FRAME_RESET]: new Hook(HOOK_ON_FRAME_RESET, []),
    [HOOK_ON_UPGRADE_COMPLETED]: new Hook(HOOK_ON_UPGRADE_COMPLETED, ["upgrade"]),
    [HOOK_ON_UNITS_SELECTED]: new Hook(HOOK_ON_UNITS_SELECTED, ["units"]),
    [HOOK_ON_TECH_COMPLETED]: new Hook(HOOK_ON_TECH_COMPLETED, ["tech"]),
});

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

    readonly hooks: Record<string, Hook> = createDefaultHooks();

    initializePlugin(pluginPackage: InitializedPluginPackage) {

        try {
            const c = createCompartment();
            const pluginRaw = pluginPackage.nativeSource ? c.globalThis.Function(pluginPackage.nativeSource)() : {};

            //override but give a truthy value
            pluginPackage.nativeSource = "true";

            pluginRaw.id = pluginPackage.id;
            pluginRaw.name = pluginPackage.name;
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

            const nonEditableKeys = ["id", "name", "$$permissions"];

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

            plugin.config = processConfigBeforeReceive(pluginPackage.config);
            plugin.sendUIMessage = throttle((message: any) => {
                this.#sendCustomUIMessage(plugin, message);
            }, 100, { leading: true, trailing: false });;
            plugin.registerCustomHook = (name: string, args: string[], async = false) => {
                this.#registerCustomHook(name, args, pluginPackage.id, async);
            };
            plugin.callCustomHook = (name: string, ...args: any[]) => {
                if (this.hooks[name] === undefined) {
                    log.warning(`Plugin ${pluginPackage.name} tried to call hook ${name} but it was not found`);
                }
                else if (this.hooks[name].isAuthor(pluginPackage.id)) {
                    return this.callHook(name, ...args);
                }
            };
            plugin.isSceneController = !!plugin.onEnterScene;
            log.verbose(`@plugin-system-native: initialized plugin "${plugin.name}"`);

            return plugin;
        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`@plugin-system: failed to initialize "${pluginPackage.name}" - ${e.message}`);
            }
        }
    };

    constructor(pluginPackages: InitializedPluginPackage[], uiPlugins: PluginSystemUI) {
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
        return this.#nativePlugins.filter(p => (p as SceneInputHandler).onEnterScene) as SceneInputHandler[];
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
        if (this.hooks[name] !== undefined) {
            log.error(`@plugin-system: hook ${name} already registered`);
            return;
        }

        if (!name.startsWith("onCustom")) {
            log.error(`@plugin-system: hook ${name} must start with "onCustom"`);
            return;
        }

        this.hooks[name] = new Hook(name, args, { async, hookAuthorPluginId });
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
                plugin.dispose && plugin.dispose();
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
            }
        }
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
        }
    }

    #sceneInputHandlerGaurd(plugin: NativePlugin) {
        return !plugin.isSceneController || this.#activeSceneInputHandler === plugin;
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

    enableAdditionalPlugins(pluginPackages: InitializedPluginPackage[]) {
        const additionalPlugins = pluginPackages.map(p => this.initializePlugin(p)).filter(Boolean);

        this.#nativePlugins = [...this.#nativePlugins, ...additionalPlugins];
    }

    /**
     * Temporarily inject an api into all active plugins.
     */
    injectApi(object: {}) {
        mix(pluginProto, object);
        const keys = Object.keys(object);

        return () => {
            keys.forEach(key => {
                delete pluginProto[key as keyof typeof pluginProto];
            })
        }
    }

    callHook(hookName: string, ...args: any[]) {
        if (this.hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        let context;
        for (const plugin of this.#nativePlugins) {
            if (!this.hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined && this.#sceneInputHandlerGaurd(plugin)) {
                plugin.context = context;
                context = plugin[hookName as keyof typeof plugin].apply(plugin, args) ?? context;
                delete plugin.context;
            }
        }
        return context;
    }

    async callHookAsync(hookName: string, ...args: any[]) {
        if (this.hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        let context;
        for (const plugin of this.#nativePlugins) {
            if (!this.hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined && this.#sceneInputHandlerGaurd(plugin)) {
                plugin.context = context;
                context = await plugin[hookName as keyof typeof plugin].apply(plugin, args) ?? context;
                delete plugin.context;
            }
        }
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