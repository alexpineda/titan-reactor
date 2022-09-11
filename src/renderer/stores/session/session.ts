import { OpenBW, SessionSettingsData } from "common/types";
import { Macros } from "@macros";
import settingsStore, { useSettingsStore } from "../settings-store";
import Janitor from "@utils/janitor";
import { createPluginSession } from "@plugins/create-plugin-session";
import { PluginSystemNative, SceneController } from "@plugins/plugin-system-native";
import { createReactiveSessionVariables } from "./reactive-session-variables";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { SEND_BROWSER_WINDOW, SERVER_API_FIRE_MACRO } from "common/ipc-handle-names";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
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
    onExitScene(sceneController: string | undefined): void;
    onSceneReady(): Promise<void>;
    reloadPlugins: () => Promise<void>;

}

export type SessionStore = SessionSettingsData;

/**
 * Creates a session for a game.
 * Manages the interaction between settings, session data & api, plugins and macros.
 */
export const createSession = async (openBW: OpenBW): Promise<Session> => {

    const janitor = new Janitor();

    // available to plugins, macros, and sandbox
    const sessionApi = janitor.mop(createReactiveSessionVariables());

    // configure macro system
    const macros = new Macros();
    macros.deserialize(settingsStore().data.macros);

    janitor.mop(macros.listenForKeyCombos());

    macros.doSessionAction = sessionApi.doAction;
    macros.getSessionProperty = sessionApi.getRawValue;


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

    useSettingsStore.subscribe((settings) => {

        if (settings.data.macros.revision !== macros.revision) {

            macros.deserialize(settings.data.macros);

        }

    })

    let plugins = await createPluginSession(macros);

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
        onExitScene(sceneController) {
            macros.callFromHook("onExitScene", sceneController);
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

            const safeAPI = mix({ settings: sessionApi.sessionVars }, gameTimeApi);

            // unsafe api additionally allows access to plugin configurations
            // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
            const unSafeAPI = mix({ plugins: plugins.reactiveApi.pluginVars, settings: sessionApi.sessionVars }, gameTimeApi);

            const container = createCompartment(unSafeAPI);
            macros.setCreateCompartment((context?: any) => {
                container.globalThis.context = context;
                return container;
            });

            plugins.nativePlugins.injectApi(safeAPI);

        },
        async reloadPlugins() {
            plugins.dispose();
            plugins = await createPluginSession(macros);
        }
    };
};
