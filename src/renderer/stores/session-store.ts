import create, { GetState, SetState, UseStore } from "zustand";

import { Settings, MacroActionType, SettingsMeta, OpenBW, SessionData, MacroActionHostModifyValue, MacroActionPluginModifyValue } from "common/types";
import { doMacroActionEffect, Macros } from "@macros";
import { getSessionLevaConfigField } from "common/get-app-settings-leva-config";
import deepMerge from 'deepmerge';
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import settingsStore, { SettingsStore, useSettingsStore } from "./settings-store";
import { diff } from "deep-diff";
import set from "lodash.set";
import getProp from "lodash.get";
import * as log from "@ipc/log";
import { BasePlayer } from "@core/players";
import Janitor from "@utils/janitor";
import { listenToEvents } from "@utils/macro-utils";
import { createPluginSession } from "@plugins/create-plugin-session";
import { PluginSystemNative, SceneController } from "@plugins/plugin-system-native";
import { UI_SYSTEM_PLUGIN_CONFIG_CHANGED } from "@plugins/events";

export type SessionStore = SessionData & {
    minimapScale: number;
    merge: (rhs: DeepPartial<Settings>) => void;
    players: BasePlayer[];
    sandboxMode: boolean;
}

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
    useSessionStore: UseStore<SessionStore>;
    sessionApi: {};
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
}

export const createSession = async (ogData: SessionData, players: BasePlayer[], openBW: OpenBW): Promise<Session> => {

    const janitor = new Janitor();
    const plugins = janitor.mop(await createPluginSession());

    const callbacks: SessionCallbacks = {
        needsResize: () => { },
        audioChanged: () => { }
    }

    const useSessionStore = create<SessionStore>((set: SetState<SessionStore>, get: GetState<SessionStore>) => ({

        audio: JSON.parse(JSON.stringify(ogData.audio)),
        game: JSON.parse(JSON.stringify(ogData.game)),
        postprocessing: JSON.parse(JSON.stringify(ogData.postprocessing)),
        postprocessing3d: JSON.parse(JSON.stringify(ogData.postprocessing3d)),

        players,
        minimapScale: 1,
        get sandboxMode() {
            return openBW.isSandboxMode();
        },
        set sandboxMode(value: boolean) {
            openBW.setSandboxMode(value);
        },
        merge: async (rhs: DeepPartial<Settings>) => {

            const newSettings = deepMerge<DeepPartial<Settings>>(get(), rhs, { arrayMerge: overwriteMerge });
            //@ts-ignore
            set({ ...newSettings });

        }


    }));

    const doSessionAction = async (action: MacroActionHostModifyValue) => {
        if (action.type !== MacroActionType.ModifyAppSettings) {
            log.warning("@settingsStore.doMacroAction. Macro type is invalid.");
            return;
        }

        const field = getSessionLevaConfigField(useSessionStore.getState(), settingsStore().enabledPlugins, action.field!) as any;
        if (field === undefined) {
            log.warning("@settingsStore.doMacroAction. Settings field is no found.");
            return;
        }


        const existingValue = field.value;
        let value = doMacroActionEffect(action, existingValue, field.value, field.step, field.min, field.max, field.options);

        const newSettings = {};
        lSet(newSettings, action.field!, value);
        useSessionStore.getState().merge(newSettings);

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
    macros.getSessionProperty = (field) => getProp(useSessionStore.getState(), field);
    macros.getPluginProperty = (name, field) => getProp(plugins.nativePlugins.getByName(name)?.rawConfig ?? {}, field);

    plugins.nativePlugins.callFromHook = (...args) => macros.callFromHook(...args);

    macros.deserialize(settingsStore().data.macros);

    janitor.mop(listenToEvents(macros, plugins.nativePlugins));

    janitor.mop(listenForNewSettings((mergeSettings, settings) => {

        useSessionStore.getState().merge({
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

    const sessionApi = {

    }

    return {
        useSessionStore,
        sessionApi,
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

export const listenForNewSettings = (onNewSettings: (mergeSettings: DeepPartial<SettingsMeta>, settings: SettingsStore, prevSettings: SettingsStore) => void) =>
    useSettingsStore.subscribe((settings, prevSettings) => {

        const diffs = diff(prevSettings, settings);
        if (diffs === undefined)
            return;

        // update our session with the new user manipulated settings
        const mergeSettings: DeepPartial<SettingsMeta> = {
            data: {}
        };

        for (const d of diffs) {
            if (d.kind === "E" && d.path) {
                const parentProp = getProp(settings, d.path.slice(0, d.path.length - 1));
                // don't diff down to array elements, just the entire array is fine!
                // otherwise we're left with a sparse array :(
                if (Array.isArray(parentProp) && typeof d.path[d.path.length - 1] === "number") {
                    set(parentProp, d.path, d.rhs);
                    set(mergeSettings, d.path.slice(0, d.path.length - 1), parentProp);
                } else {
                    set(mergeSettings, d.path, d.rhs);
                }
            }
        }

        onNewSettings(mergeSettings, settings, prevSettings)
    })

