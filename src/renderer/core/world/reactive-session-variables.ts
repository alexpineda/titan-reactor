
import { FieldDefinition, ModifyValueActionEffect, SessionSettingsData, MacroActionHostModifyValue } from "common/types";
import deepMerge from 'deepmerge';
import { doActionEffect } from "@macros";
import { fromNestedToSessionLevaConfig, fromnNestedToSessionLevaField } from "common/get-app-settings-leva-config";
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import lGet from "lodash.get";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import * as log from "@ipc/log";
import Janitor from "@utils/janitor";
import { BeforeSet, createReactiveVariable, ReactiveVariable } from "@utils/create-reactive-variable";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";

const overwriteMerge = (_: any, sourceArray: any) => sourceArray;

export type MergeSessionStore = (rhs: DeepPartial<SessionSettingsData>) => void;

const applyEffectToSessionProperty = (mergeRootSession: MergeSessionStore, effect: ModifyValueActionEffect, path: string[], field: FieldDefinition, newValue: any, resetValue: any, beforeSet?: (newValue: any, field: FieldDefinition) => boolean | void) => {

    let value = doActionEffect(effect, field, newValue, resetValue);

    if (beforeSet && beforeSet(value, field) === false) {
        return;
    }

    const newSettings = {};
    lSet(newSettings, path, value);
    mergeRootSession(newSettings);

}

const getSessionSettingsField = (settingsData: SessionSettingsData, path: string[]) => {

    const field = fromnNestedToSessionLevaField(settingsData, settingsStore().enabledPlugins, path) as FieldDefinition | undefined;

    if (field === undefined) {
        log.warning("Session field is no found.");
        return;
    }

    return field;

}

const validAppSettingsPaths = ["audio.", "game.", "postprocessing.", "postprocessing3d."];
const isValidkey = (key: string) => {
    for (const path of validAppSettingsPaths) {
        if (key.startsWith(path)) {
            return true;
        }
    }
}

export type SessionVariables = {
    [K in keyof SessionSettingsData]: {
        [T in keyof SessionSettingsData[K]]: ReactiveVariable
    };
}

export type ReactiveSessionVariables = ReturnType<typeof createReactiveSessionVariables>;
/**
 * An api that allows the consumer to modify setting values and have the system respond, eg fog of war level.
 */
export const createReactiveSessionVariables = (events: TypeEmitter<WorldEvents>) => {

    const janitor = new Janitor();
    const initialSettings = settingsStore().data;

    const store = {
        audio: initialSettings.audio,
        game: initialSettings.game,
        postprocessing: initialSettings.postprocessing,
        postprocessing3d: initialSettings.postprocessing3d,
    };

    const mergeRootSession = async (rhs: DeepPartial<SessionSettingsData>) => {

        console.debug("updating session");

        const newSettings = deepMerge<DeepPartial<SessionSettingsData>>(store, rhs, { arrayMerge: overwriteMerge });

        if (events.emit("settings-changed", { settings: store, rhs }) !== false) {
            Object.assign(store, newSettings);
        }

    }

    // keep the session up to date with user changed settings
    useSettingsStore.subscribe(settings => {

        console.debug("merging session with settings");

        Object.assign(store, {
            audio: settings.data.audio,
            game: settings.data.game,
            postprocessing: settings.data.postprocessing,
            postprocessing3d: settings.data.postprocessing3d,
        });

        events.emit("settings-changed", { settings: store, rhs: {} });


    })

    function applyEffectToSessionRoot(effect: ModifyValueActionEffect, path: string[], field: FieldDefinition, newValue?: any, beforeSet?: BeforeSet) {

        applyEffectToSessionProperty(mergeRootSession, effect, path, field, newValue, lGet(settingsStore().data, path), beforeSet);

    }

    const defineSessionProperty = createReactiveVariable(applyEffectToSessionRoot, (path) => lGet(store, path));

    const sessionSettingsConfig = fromNestedToSessionLevaConfig(settingsStore().data, settingsStore().enabledPlugins);

    // {
    //     sandboxMode: defineSessionProperty(false, ["sandboxMode"], (newValue) => {
    //         return openBW.setSandboxMode(newValue) !== undefined;
    //     }

    const sessionVars = (Object.entries(sessionSettingsConfig).reduce((acc, [key, value]) => {
        if (isValidkey(key)) {
            const settingsKey = key.split(".");
            lSet<SessionVariables>(acc, settingsKey, defineSessionProperty(value, settingsKey));
            lSet<SessionVariables>(acc, [...settingsKey.slice(0, -1), `get${[...settingsKey.slice(-1)][0].slice(0, 1).toUpperCase()}${settingsKey.slice(-1)[0].slice(1)}`], () => lGet(store, settingsKey));
        }
        return acc;
    }, {})) as SessionVariables;

    const getRawValue = (path: string[]) => lGet(store, path);

    // A macro has defined the session field it is interested in
    const mutate = async (action: MacroActionHostModifyValue) => {

        const field = getSessionSettingsField(store, action.field!);

        if (field) {
            applyEffectToSessionRoot(action.effect, action.field!, field, action.value);
        }

    }

    const getState = () => store;

    return { getRawValue, sessionVars, mutate, getState, dispose: () => janitor.dispose(), events };
}
