import * as log from "@ipc/log";
import { InitializedPluginPackage } from "common/types";
import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import * as postprocessing from "postprocessing"

import withErrorMessage from "common/utils/with-error-message";
import { PluginSystemUI } from "./plugin-system-ui";
import { SYSTEM_EVENT_CUSTOM_MESSAGE } from "./events";
import { HOOK_ON_FRAME_RESET, HOOK_ON_GAME_DISPOSED, HOOK_ON_GAME_READY, HOOK_ON_SCENE_PREPARED, HOOK_ON_UNITS_CLEAR_FOLLOWED, HOOK_ON_UNITS_FOLLOWED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_UNFOLLOWED, HOOK_ON_UNIT_KILLED } from "./hooks";
import { CameraModePlugin } from "../input/camera-mode";
import { Vector3 } from "three";
import { updatePluginsConfig } from "@ipc/plugins";
import { PERMISSION_REPLAY_COMMANDS, PERMISSION_REPLAY_FILE, PERMISSION_SETTINGS_WRITE } from "./permissions";
import settingsStore from "@stores/settings-store";
import throttle from "lodash.throttle";
import Janitor from "@utils/janitor";

const STDLIB = {
    CSS2DObject
}

interface PluginPrototype {
    id: string;
    config?: {
        [key: string]: any
    };
    $$permissions: {
        [key: string]: boolean
    },
    $$config: {
        [key: string]: any
    },
    setConfig: (key: string, value: any) => any;
    saveSettings: (settings: { audio?: {}, graphics?: {} }) => any;
}

export interface NativePlugin extends PluginPrototype {
    id: string;
    name: string;
    /**
     * Called when a plugin has it's configuration changed by the user
     */
    onConfigChanged?: (oldConfig: {}) => void;
    /**
     * Called on a plugins initialization for convenience
     */
    onPluginCreated?: () => void;
    /**
     * CaLLed when a plugin must release its resources
     */
    onPluginDispose?: () => void;
    /**
     * Called when an React component sends a message to this window
     */
    onUIMessage?: (message: any) => void;
    /**
     * Called just before render
     */
    onBeforeRender?: (delta: number, elapsed: number, target: Vector3, position: Vector3) => void;
    /**
     * Called after rendering is done
     */
    onRender?: (delta: number, elapsed: number) => void;
    /**
     * Called on a game frame
     */
    onFrame?: (frame: number, commands?: any[]) => void;
    config: {
        cameraModeKey?: string
    };
    /**
     * Used for message passing in hooks
     */
    context: any;
}

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
    onGameDisposed: new Hook(HOOK_ON_GAME_DISPOSED, []),
    onGameReady: new Hook(HOOK_ON_GAME_READY, [], { async: true }),
    onScenePrepared: new Hook(HOOK_ON_SCENE_PREPARED, ["scene", "sceneUserData", "map", "replayHeader"]),
    onUnitCreated: new Hook(HOOK_ON_UNIT_CREATED, ["unit"]),
    onUnitKilled: new Hook(HOOK_ON_UNIT_KILLED, ["unit"]),
    onFrameReset: new Hook(HOOK_ON_FRAME_RESET, []),
    onUnitsFollowed: new Hook(HOOK_ON_UNITS_FOLLOWED, ["units"]),
    onUnitUnfollowed: new Hook(HOOK_ON_UNIT_UNFOLLOWED, ["unit"]),
    onUnitClearFollowed: new Hook(HOOK_ON_UNITS_CLEAR_FOLLOWED, [])
});



const pluginProto: PluginPrototype = {
    id: "",
    $$permissions: {},
    $$config: {},
    setConfig(key: string, value: any) {
        if (this.$$config?.[key]?.value !== undefined) {
            this.$$config[key].value = value;
            updatePluginsConfig(this.id, this.$$config);
        }
    },
    saveSettings(settings: { audio?: {}, graphics?: {}, util?: {} }) {
        if (this.$$permissions[PERMISSION_SETTINGS_WRITE]) {
            const state = settingsStore();
            state.save({
                audio: {
                    ...state.data.audio,
                    ...settings.audio,
                },
                graphics: {
                    ...state.data.graphics,
                    ...settings.graphics
                },
                util: {
                    ...state.data.util,
                    ...settings.util
                }
            }
            );
        }
    },
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
    PERMISSION_SETTINGS_WRITE,
    PERMISSION_REPLAY_COMMANDS,
    PERMISSION_REPLAY_FILE
];
export class PluginSystemNative {
    #nativePlugins: NativePlugin[] = [];
    #uiPlugins: PluginSystemUI;

    readonly hooks: Record<string, Hook> = createDefaultHooks();

    initializePlugin(pluginPackage: InitializedPluginPackage) {

        try {
            if (!pluginPackage.nativeSource) {
                throw new Error("No native source provided");
            }
            const pluginRaw = Function(pluginPackage.nativeSource!)({ THREE, STDLIB, postprocessing, Janitor });
            delete pluginPackage.nativeSource;

            pluginRaw.id = pluginPackage.id;
            pluginRaw.name = pluginPackage.name;
            //FIXME: freeze config but allow us to edit for saving
            // possibly use a Weakmap instead of attaching to object
            pluginRaw.$$config = { ...pluginPackage.config };

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
            const sendUIMessage = throttle((message: any) => {
                this.sendCustomUIMessage(pluginPackage.id, message);
            }, 100, { leading: true, trailing: false });
            plugin.sendUIMessage = sendUIMessage;
            plugin.registerCustomHook = (name: string, args: string[], async = false) => {
                this.#registerCustomHook(name, args, pluginPackage.id, async);
            };
            plugin.callCustomHook = (name: string, ...args: any[]) => {
                if (this.hooks[name].isAuthor(pluginPackage.id)) {
                    return this.callHook(name, ...args);
                }
            };
            log.info(`@plugin-system-native: initialized plugin "${plugin.name}"`);
            plugin.onPluginCreated && plugin.onPluginCreated();

            return plugin;
        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`@plugin-system: failed to initialize "${pluginPackage.name}" - ${e.message}`);
            }
        }
    };

    constructor(pluginPackages: InitializedPluginPackage[], uiPlugins: PluginSystemUI) {
        this.#nativePlugins = pluginPackages.filter(p => Boolean(p.nativeSource)).map(p => this.initializePlugin(p)).filter(Boolean);

        this.#uiPlugins = uiPlugins;
    }

    getDefaultCameraModePlugin() {
        const plugin = this.#nativePlugins.find(p => p.config?.cameraModeKey === "Escape");

        if (plugin) {
            return plugin as unknown as CameraModePlugin;
        }

        throw new Error("No default camera mode plugin found. Please provide a cameraModeKey in the plugin config with value of Escape.");
    }

    getCameraModePlugins() {
        return this.#nativePlugins.filter(p => p.config.cameraModeKey) as CameraModePlugin[];
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

    sendCustomUIMessage(pluginId: string, message: any) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                this.#uiPlugins.sendMessage({
                    type: SYSTEM_EVENT_CUSTOM_MESSAGE,
                    payload: {
                        pluginId,
                        message
                    }
                });
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: sendCustomUIMessage "${plugin.name}"`, e));
            }
        }
    }

    onUIMessage(pluginId: string, message: any) {
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
                plugin.onPluginDispose && plugin.onPluginDispose();
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
            }
        }
        this.#nativePlugins = [];
    }

    onPluginDispose(pluginId: string) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.onPluginDispose && plugin.onPluginDispose();
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
            }
            this.#nativePlugins = this.#nativePlugins.filter(p => p !== plugin);
        }
    }

    onConfigChanged(pluginId: string, config: any) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                const oldConfig = { ...plugin.config };
                plugin.config = processConfigBeforeReceive(config);
                plugin.onConfigChanged && plugin.onConfigChanged(oldConfig);
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onConfigChanged "${plugin.name}"`, e));
            }
        }
    }

    onBeforeRender(delta: number, elapsed: number, target: Vector3, position: Vector3) {
        for (const plugin of this.#nativePlugins) {
            plugin.onBeforeRender && plugin.onBeforeRender(delta, elapsed, target, position);
        }
    }

    onRender(delta: number, elapsed: number) {
        for (const plugin of this.#nativePlugins) {
            plugin.onRender && plugin.onRender(delta, elapsed);
        }
    }

    onFrame(frame: number, commands: any[]) {
        for (const plugin of this.#nativePlugins) {
            if (plugin.onFrame) {
                if (plugin.$$permissions[PERMISSION_REPLAY_COMMANDS]) {
                    plugin.onFrame(frame, commands);
                } else {
                    plugin.onFrame(frame)
                }
            }
        }
    }

    enableAdditionalPlugins(pluginPackages: InitializedPluginPackage[]) {
        const additionalPlugins = pluginPackages.filter(p => Boolean(p.nativeSource)).map(p => this.initializePlugin(p)).filter(Boolean);

        this.#nativePlugins = [...this.#nativePlugins, ...additionalPlugins];
    }

    /**
     * Temporarily inject an api into all active plugins.
     */
    injectApi(object: {}) {
        Object.assign(pluginProto, object);
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
            if (!this.hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined) {
                plugin.context = context;
                //@ts-ignore
                context = plugin[hookName].apply(plugin, args) ?? context;
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
            if (!this.hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined) {
                plugin.context = context;
                //@ts-ignore
                context = await plugin[hookName].apply(plugin, args) ?? context;
                delete plugin.context;
            }
        }
        return context;
    }
}