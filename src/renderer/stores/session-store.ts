import create, { UseStore } from "zustand";

import { Settings, MacroActionType, OpenBW, SessionData, MacroActionHostModifyValue, MacroActionPluginModifyValue } from "common/types";
import { Macros } from "@macros";
import deepMerge from 'deepmerge';
import { DeepPartial } from "common/types";
import lGet from "lodash.get";
import settingsStore from "./settings-store";
import * as log from "@ipc/log";
import { BasePlayer } from "@core/players";
import Janitor from "@utils/janitor";
import { listenToEvents } from "@utils/macro-utils";
import { createPluginSession } from "@plugins/create-plugin-session";
import { PluginSystemNative, SceneController } from "@plugins/plugin-system-native";
import { UI_SYSTEM_PLUGIN_CONFIG_CHANGED } from "@plugins/events";
import { applyEffectToSessionProperty, createReactiveSessionApi, getSessionSettingsField, listenForNewSettings } from "./session-reactive";

export type SessionStore = SessionData & {
    minimapScale: number;
    players: BasePlayer[];
    sandboxMode: boolean;
}

export type MergeSessiomStore = (rhs: DeepPartial<Settings>) => void;

const overwriteMerge = (_: any, sourceArray: any) => sourceArray;

export type SessionCallbacks = {
    needsResize: () => void;
    audioChanged: (audio: SessionData["audio"]) => void

};

export type Session = {
    onFrame: (
        currentFrame: number,
        commands: any[]
    ) => void;
    onBeforeRender: (delta: number,
        elapsed: number) => void;
    onRender: (delta: number, elapsed: number) => void;
    sessionApi: ReturnType<typeof createReactiveSessionApi>,
    dispose: () => void;
    callbacks: SessionCallbacks;
    getSceneInputHandler: (name: string) => SceneController | undefined;
    callHook: (
        ...args: Parameters<PluginSystemNative["callHook"]>) => void;
    callHookAsync: (
        ...args: Parameters<PluginSystemNative["callHookAsync"]>
    ) => Promise<void>,

    //TODO: remove this
    macros: Macros,
    plugins: Awaited<ReturnType<typeof createPluginSession>>;
    getState(): SessionStore;
    subscribe: UseStore<SessionStore>["subscribe"];
    useSessionStore: UseStore<SessionStore>;
}

export const createSession = async (players: BasePlayer[], openBW: OpenBW): Promise<Session> => {

    const janitor = new Janitor();
    const plugins = janitor.mop(await createPluginSession());

    const callbacks: SessionCallbacks = {
        needsResize: () => { },
        audioChanged: () => { }
    }

    const initialSettings = settingsStore().data;

    const useSessionStore = create<SessionStore>(() => ({

        audio: JSON.parse(JSON.stringify(initialSettings.audio)),
        game: JSON.parse(JSON.stringify(initialSettings.game)),
        postprocessing: JSON.parse(JSON.stringify(initialSettings.postprocessing)),
        postprocessing3d: JSON.parse(JSON.stringify(initialSettings.postprocessing3d)),
        sandboxMode: false,
        players,
        minimapScale: 1,

    }));

    const merge = async (rhs: DeepPartial<Settings>) => {

        const newSettings = deepMerge<DeepPartial<Settings>>(useSessionStore.getState(), rhs, { arrayMerge: overwriteMerge });
        //@ts-ignore
        useSessionStore.setState({ ...newSettings });

    }

    // const getSettingsField = (path: string[]) => {
    //     const field = getAppSettingsLevaConfigField(settingsStore().data, settingsStore().enabledPlugins, path) as FieldDefinition | undefined;
    //     if (field === undefined) {
    //         log.warning("Session field is no found.");
    //         return;
    //     }
    //     return field;
    // }
    const doSessionAction = async (action: MacroActionHostModifyValue) => {
        if (action.type !== MacroActionType.ModifyAppSettings) {
            log.warning("@settingsStore.doMacroAction. Macro type is invalid.");
            return;
        }

        const field = getSessionSettingsField(useSessionStore.getState(), action.field!);

        if (field) {
            applyEffectToSessionProperty(merge, action.effect, action.field!, field, action.value, action.resetValue);
        }

    }

    const doPluginAction = async (action: MacroActionPluginModifyValue) => {
        const result = plugins.nativePlugins.doMacroAction(action);
        if (result) {
            plugins.uiPlugins.sendMessage({
                type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                payload: result
            });
        }
    }

    janitor.mop(() => useSessionStore.destroy());

    const _clickPassThrough = (evt: MouseEvent) => plugins.onClick(evt);
    document.body.addEventListener("mouseup", _clickPassThrough);
    janitor.mop(() => document.body.removeEventListener("mouseup", _clickPassThrough));

    const macros = new Macros();

    macros.doSessionAction = doSessionAction;
    macros.doPluginAction = doPluginAction;
    macros.getSessionProperty = (field) => lGet(useSessionStore.getState(), field);
    macros.getPluginProperty = (name, field) => lGet(plugins.nativePlugins.getByName(name)?.rawConfig ?? {}, field);

    plugins.nativePlugins.callFromHook = (...args) => macros.callFromHook(...args);

    macros.deserialize(settingsStore().data.macros);

    janitor.mop(listenToEvents(macros, plugins.nativePlugins));

    janitor.mop(listenForNewSettings((mergeSettings, settings) => {

        merge({
            audio: settings.data.audio,
            game: settings.data.game,
            postprocessing: settings.data.postprocessing,
            postprocessing3d: settings.data.postprocessing3d,
        })

        if (settings.data.macros.revision !== macros.revision) {

            macros.deserialize(settings.data.macros);

        }

        macros.setHostDefaults(settings.data);

        if (mergeSettings.data?.graphics?.pixelRatio || mergeSettings.data?.game?.minimapSize) {
            callbacks.needsResize();
        }

        if (mergeSettings?.data?.audio) {
            callbacks.audioChanged(settings.data.audio);
        }

    }));

    return {
        useSessionStore,
        sessionApi: createReactiveSessionApi(useSessionStore, merge, openBW),
        dispose: () => janitor.dispose(),
        callbacks,
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
        //deprecate
        plugins,
        macros,
        getState: () => useSessionStore.getState(),
        get subscribe() {
            return useSessionStore.subscribe
        }
    };
};
