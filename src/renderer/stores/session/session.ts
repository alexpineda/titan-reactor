import { OpenBW, SessionSettingsData } from "common/types";
import { Macros } from "@macros";
import settingsStore, { useSettingsStore } from "../settings-store";
import Janitor from "@utils/janitor";
import { createPluginSession } from "@plugins/create-plugin-session";
import { PluginSystemNative, SceneController } from "@plugins/plugin-system-native";
import { UI_SYSTEM_PLUGIN_CONFIG_CHANGED } from "@plugins/events";
import { createReactiveSessionVariables } from "./reactive-session-variables";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { SEND_BROWSER_WINDOW, SERVER_API_FIRE_MACRO } from "common/ipc-handle-names";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { createReactivePluginApi } from "./reactive-plugin-variables";
import { createCompartment } from "@utils/ses-util";
import { HOOK_ON_SCENE_READY } from "@plugins/hooks";
import { mix } from "@utils/object-utils";
import { GameTimeApi } from "renderer/scenes/game-scene/game-time-api";

export type Session = {
    onFrame: (
        currentFrame: number,
        commands: any[]
    ) => void;
    onBeforeRender: (delta: number,
        elapsed: number) => void;
    onRender: (delta: number, elapsed: number) => void;
    sessionApi: ReturnType<typeof createReactiveSessionVariables>,
    dispose: () => void;
    getSceneInputHandler: (name: string) => SceneController | undefined;
    callHook: (
        ...args: Parameters<PluginSystemNative["callHook"]>) => void;
    callHookAsync: (
        ...args: Parameters<PluginSystemNative["callHookAsync"]>
    ) => Promise<void>,
    initializeContainer(gameTimeApi: GameTimeApi): void;
    onEnterScene(sceneController: SceneController): void;
    onSceneReady(): Promise<void>
}

export type SessionStore = SessionSettingsData;

/**
 * Creates a session for a game.
 * Manages the interaction between settings, session data & api, plugins and macros.
 */
export const createSession = async (openBW: OpenBW): Promise<Session> => {

    const janitor = new Janitor();
    const plugins = janitor.mop(await createPluginSession());

    // available to plugins, macros, and sandbox
    const sessionApi = janitor.mop(createReactiveSessionVariables());

    // available to macros and sandbox only
    const pluginApi = createReactivePluginApi(plugins.nativePlugins);

    const _clickPassThrough = (evt: MouseEvent) => plugins.onClick(evt);
    document.body.addEventListener("mouseup", _clickPassThrough);
    janitor.mop(() => document.body.removeEventListener("mouseup", _clickPassThrough));

    // configure macro system
    const macros = new Macros();
    macros.deserialize(settingsStore().data.macros);

    janitor.mop(macros.listenForKeyCombos());

    macros.doPluginAction = (action) => {
        const result = pluginApi.doAction(action);
        if (result) {
            plugins.uiPlugins.sendMessage({
                type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                payload: result
            });
        }
    };
    macros.doSessionAction = sessionApi.doAction;
    macros.getSessionProperty = sessionApi.getRawValue;
    macros.getPluginProperty = pluginApi.getRawValue;

    janitor.on(ipcRenderer, SERVER_API_FIRE_MACRO, (_: IpcRendererEvent, macroId: string) => {
        macros.execMacroById(macroId);
    });


    // a macro was triggered manually or via web server
    janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
        type: SendWindowActionType.ManualMacroTrigger,
        payload: SendWindowActionPayload<SendWindowActionType.ManualMacroTrigger>
    }) => {
        if (type === SendWindowActionType.ManualMacroTrigger) {
            macros.execMacroById(payload);
        }
    });

    for (const macro of macros) {
        plugins.nativePlugins.setAllMacroDefaults(macro);
    }

    plugins.nativePlugins.externalHookListener = (...args) => macros.callFromHook(...args);

    // The user changed a plugin config
    janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, async (_: any, { type, payload: { pluginId, config } }: {
        type: SendWindowActionType.PluginConfigChanged
        payload: SendWindowActionPayload<SendWindowActionType.PluginConfigChanged>
    }) => {
        if (type === SendWindowActionType.PluginConfigChanged) {
            for (const macro of macros) {
                plugins.nativePlugins.setMacroDefaults(macro, pluginId, config);
            }
        }
    })

    useSettingsStore.subscribe((settings) => {

        if (settings.data.macros.revision !== macros.revision) {

            macros.deserialize(settings.data.macros);

        }

    })

    return {
        sessionApi,
        dispose: () => {
            janitor.dispose()
        },
        onFrame: (
            currentFrame: number,
            commands: any[]
        ) => {

            plugins.uiPlugins.onFrame(openBW, currentFrame, openBW._get_buffer(8), openBW._get_buffer(9),);
            plugins.nativePlugins.hook_onFrame(
                currentFrame,
                commands
            );

        },
        onBeforeRender: (
            delta: number,
            elapsed: number,
        ) => {
            plugins.nativePlugins.hook_onBeforeRender(delta, elapsed);
        },
        onRender: (delta: number, elapsed: number) => {
            plugins.nativePlugins.hook_onRender(delta, elapsed);
        },
        onEnterScene(sceneController) {
            plugins.nativePlugins.setActiveSceneController(sceneController);
        },
        async onSceneReady() {
            await plugins.nativePlugins.callHookAsync(HOOK_ON_SCENE_READY);
        },
        getSceneInputHandler: (name: string) => {
            return plugins.nativePlugins.getSceneInputHandlers().find((handler) => handler.name === name);
        },
        callHook: (
            ...args: Parameters<PluginSystemNative["callHook"]>
        ) => {
            plugins.nativePlugins.callHook(...args);
        },
        callHookAsync: async (
            ...args: Parameters<PluginSystemNative["callHookAsync"]>
        ) => {
            await plugins.nativePlugins.callHookAsync(...args);
        },
        initializeContainer(gameTimeApi: GameTimeApi) {

            const safeAPI = mix({}, gameTimeApi, sessionApi.sessionVars);

            // unsafe api simply allows access to plugin configurations
            // which is not allowed WITHIN plugins since they are 3rd party, but ok in macros and sandbox
            const unSafeAPI = mix({ plugins: pluginApi.pluginVars }, gameTimeApi, sessionApi.sessionVars);

            const container = createCompartment(unSafeAPI);
            macros.setCreateCompartment((context?: any) => {
                container.globalThis.context = context;
                return container;
            });

            plugins.nativePlugins.injectApi(safeAPI);


        }
    };
};
