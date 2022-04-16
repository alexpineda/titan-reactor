import * as log from "@ipc/log";
import { InitializedPluginPackage } from "common/types";
import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import * as postprocessing from "postprocessing"

import withErrorMessage from "common/utils/with-error-message";
import { PluginSystemUI } from "./plugin-system-ui";
import { SYSTEM_EVENT_CUSTOM_MESSAGE } from "./events";
import { HOOK_ON_FRAME_RESET, HOOK_ON_GAME_DISPOSED, HOOK_ON_GAME_READY, HOOK_ON_SCENE_PREPARED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED } from "./hooks";
import { CameraModePlugin } from "../input/camera-mode";
import { Vector3 } from "three";
import { updatePluginsConfig } from "@ipc/plugins";
import { PERMISSION_REPLAY_COMMANDS, PERMISSION_REPLAY_FILE, PERMISSION_SETTINGS_WRITE } from "./permissions";
import settingsStore from "@stores/settings-store";
import throttle from "lodash.throttle";


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
    isEnabled: boolean;
    onConfigChanged?: (newConfig: {}, oldConfig: {}) => void;
    onDisabled?: () => void;
    onUIMessage?: (message: any) => void;
    onBeforeRender?: (delta: number, elapsed: number, target: Vector3, position: Vector3) => void;
    onRender?: (delta: number, elapsed: number) => void;
    onFrame?: (frame: number, commands?: any[]) => void;
    config: {
        cameraModeKey?: string
    };
}

type HookOptions = {
    postFn?: Function;
    async?: boolean;
    hookAuthorPluginId?: string
}

// plugins may register their own custom hooks
class Hook {
    readonly args: string[];
    readonly name: string;
    protected opts: HookOptions;

    constructor(name: string, args: string[], opts: HookOptions = {}) {
        this.name = name;
        this.args = args;
        this.opts = opts;
    }

    isAsync() {
        return this.opts.async;
    }

    isAuthor(plugin: NativePlugin) {
        return this.opts.hookAuthorPluginId === plugin.id;
    }

}

const createDefaultHooks = () => ({
    onGameDisposed: new Hook(HOOK_ON_GAME_DISPOSED, []),
    onGameReady: new Hook(HOOK_ON_GAME_READY, [], { async: true }),
    onScenePrepared: new Hook(HOOK_ON_SCENE_PREPARED, ["scene", "sceneUserData", "map", "replayHeader"]),
    onUnitCreated: new Hook(HOOK_ON_UNIT_CREATED, ["unit"]),
    onUnitKilled: new Hook(HOOK_ON_UNIT_KILLED, ["unit"]),
    onFrameReset: new Hook(HOOK_ON_FRAME_RESET, [])
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
    saveSettings(settings: { audio?: {}, graphics?: {} }) {
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
            const pluginRaw = Function(pluginPackage.nativeSource!)({ THREE, STDLIB, postprocessing });
            delete pluginPackage.nativeSource;

            const pluginPropertyConfig: Record<string, {}> = {};
            for (const key in pluginRaw) {
                if (pluginRaw.hasOwnProperty(key)) {
                    pluginPropertyConfig[key as keyof typeof pluginPropertyConfig] = {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: pluginRaw[key]
                    }
                }
            }

            const permissions = Object.freeze((pluginPackage.config?.system?.permissions ?? []).reduce((acc: Record<string, boolean>, permission: string) => {
                if (VALID_PERMISSIONS.includes(permission)) {
                    acc[permission] = true;
                } else {
                    log.warning(`Invalid permission ${permission} for plugin ${pluginPackage.name}`);
                }
                return acc;
            }, {}));

            pluginPropertyConfig["$$permissions"] = {
                configurable: false,
                enumerable: false,
                writable: false,
                value: permissions
            }
            const plugin = Object.create(pluginProto, pluginPropertyConfig);

            plugin.id = pluginPackage.id;
            plugin.name = pluginPackage.name;
            plugin.config = processConfigBeforeReceive(pluginPackage.config);
            plugin.$$config = pluginPackage.config;
            const sendUIMessage = throttle((message: any) => {
                this.sendCustomUIMessage(pluginPackage.id, message);
            }, 100, { leading: true, trailing: false });
            plugin.sendUIMessage = sendUIMessage;
            plugin.isEnabled = true;
            log.info(`@plugin-system-native: initialized plugin "${plugin.name}"`);
            plugin.init && plugin.init();

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
            this.onDisable(plugin.id);
        }
        this.#nativePlugins = [];
    }

    onDisable(pluginId: string) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.isEnabled = false;
                plugin.onDisabled && plugin.onDisabled();
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
                plugin.onConfigChanged && plugin.onConfigChanged(config, oldConfig);
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

        for (const plugin of this.#nativePlugins) {
            if (!this.hooks[hookName].isAuthor(plugin) && plugin[hookName as keyof typeof plugin] !== undefined) {
                //@ts-ignore
                plugin[hookName].apply(plugin, args);
            }
        }
    }

    async callHookAsync(hookName: string, ...args: any[]) {
        if (this.hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        if (this.hooks[hookName].args.length !== args.length) {
            log.error(`@plugin-system-native: invalid arguments length`);
            return;
        }

        for (const plugin of this.#nativePlugins) {
            if (!this.hooks[hookName].isAuthor(plugin) && plugin[hookName as keyof typeof plugin] !== undefined) {
                //@ts-ignore
                await plugin[hookName].apply(plugin, args);
            }
        }

    }
}