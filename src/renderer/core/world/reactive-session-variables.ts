
import { FieldDefinition, MutateActionEffect, SessionSettingsData, MacroActionHostModifyValue } from "common/types";
import deepMerge from 'deepmerge';
import { macroEffectApply } from "@macros/macro-effect-apply";
import { BeforeSet, createMutateEffectStore, MacroEffectVariable } from "@macros/create-mutate-effect-store";
import { getSessionSettingsInLevaFormat, getSessionSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import lGet from "lodash.get";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { log } from "@ipc/log";
import { Janitor } from "three-janitor";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";
import { arrayOverwriteMerge } from "@utils/object-utils";

export type MergeSessionStore = (rhs: DeepPartial<SessionSettingsData>) => void;

const applyEffectToSessionProperty = (mergeRootSession: MergeSessionStore, effect: MutateActionEffect, path: string[], field: FieldDefinition, newValue: any, resetValue: any, beforeSet?: (newValue: any, field: FieldDefinition) => boolean | void) => {

    let value = macroEffectApply(effect, field, newValue, resetValue);

    if (beforeSet && beforeSet(value, field) === false) {
        return;
    }

    const newSettings = {};
    lSet(newSettings, path, value);
    mergeRootSession(newSettings);

}

const getSessionSettingsField = (settingsData: SessionSettingsData, path: string[]) => {

    const field = getSessionSettingsPropertyInLevaFormat(settingsData, settingsStore().enabledPlugins, path) as FieldDefinition | undefined;

    if (field === undefined) {
        log.warn("Session field is no found.");
        return;
    }

    return field;

}

type ValidAppSessionPath = `${keyof SessionSettingsData}.`;
const validAppSettingsPaths: ValidAppSessionPath[] = ["audio.", "input.", "postprocessing.", "postprocessing3d.", "minimap."];

const isValidkey = (key: string) => {
    for (const path of validAppSettingsPaths) {
        if (key.startsWith(path)) {
            return true;
        }
    }
}

export type SessionVariables = {
    [K in keyof SessionSettingsData]: {
        [T in keyof SessionSettingsData[K]]: MacroEffectVariable
    };
}

export type ReactiveSessionVariables = ReturnType<typeof createReactiveSessionVariables>;
/**
 * An api that allows the consumer to modify setting values and have the system respond, eg fog of war level.
 */
export const createReactiveSessionVariables = (events: TypeEmitter<WorldEvents>) => {

    const janitor = new Janitor("ReactiveSessionVariables");
    const initialSettings = settingsStore().data;

    const store: { [key in keyof SessionSettingsData]: SessionSettingsData[key] } = {
        audio: initialSettings.audio,
        input: initialSettings.input,
        minimap: initialSettings.minimap,
        postprocessing: initialSettings.postprocessing,
        postprocessing3d: initialSettings.postprocessing3d,
    };

    const mergeRootSession = async (rhs: DeepPartial<SessionSettingsData>) => {

        const newSettings = deepMerge(store, rhs, { arrayMerge: arrayOverwriteMerge }) as Required<SessionSettingsData>;

        if (events.emit("settings-changed", { settings: newSettings, rhs }) !== false) {
            Object.assign(store, newSettings);
        }

    }

    // keep the session up to date with user changed settings
    janitor.mop(useSettingsStore.subscribe(settings => {

        mergeRootSession(settings.data);

    }), "settings-store-subscription");


    function applyEffectToSessionRoot(effect: MutateActionEffect, path: string[], field: FieldDefinition, newValue?: any, beforeSet?: BeforeSet) {

        applyEffectToSessionProperty(mergeRootSession, effect, path, field, newValue, lGet(settingsStore().data, path), beforeSet);

    }

    const createVariable = createMutateEffectStore(applyEffectToSessionRoot, (path: string[]) => lGet(store, path));

    const sessionSettingsConfig = getSessionSettingsInLevaFormat(settingsStore().data, settingsStore().enabledPlugins);

    const vars = (Object.entries(sessionSettingsConfig).reduce((acc, [key, value]) => {
        if (isValidkey(key)) {
            const settingsKey = key.split(".");
            lSet<SessionVariables>(acc, settingsKey, createVariable(value, settingsKey));
            lSet<SessionVariables>(acc, [`get${settingsKey.map(t => t[0].toUpperCase() + t.slice(1)).join("")}`], () => lGet(store, settingsKey));
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

    return { getRawValue, vars, mutate, getState, dispose: () => janitor.dispose() };
}
