
import { FieldDefinition, ModifyValueActionEffect, SessionSettingsData, MacroActionHostModifyValue } from "common/types";
import deepMerge from 'deepmerge';
import { doActionEffect } from "@macros";
import { fromNestedToSessionLevaConfig, fromnNestedToSessionLevaField } from "common/get-app-settings-leva-config";
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import lGet from "lodash.get";
import settingsStore, { useSettingsStore } from "../settings-store";
import * as log from "@ipc/log";
import { SessionStore } from "@core/session";
import Janitor from "@utils/janitor";
import { BeforeSet, createReactiveVariable, ReactiveVariable } from "./create-reactive-variable";

const overwriteMerge = (_: any, sourceArray: any) => sourceArray;

export type MergeSessionStore = (rhs: DeepPartial<SessionStore>) => void;

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
    [K in keyof SessionStore]: {
        [T in keyof SessionStore[K]]: ReactiveVariable
    };
}

export class SessionChangeEvent extends CustomEvent<{ settings: SessionStore, rhs: DeepPartial<SessionStore> }> {
    constructor(settings: SessionStore, rhs: DeepPartial<SessionStore>) {
        super("change", { detail: { settings, rhs } });
    }
}

/**
 * An api that allows the consumer to modify setting values and have the system respond, eg fog of war level.
 */
export const createReactiveSessionVariables = () => {

    const janitor = new Janitor();
    const initialSettings = settingsStore().data;
    const events = new EventTarget;

    const store = {
        audio: JSON.parse(JSON.stringify(initialSettings.audio)),
        game: JSON.parse(JSON.stringify(initialSettings.game)),
        postprocessing: JSON.parse(JSON.stringify(initialSettings.postprocessing)),
        postprocessing3d: JSON.parse(JSON.stringify(initialSettings.postprocessing3d)),
    };

    const mergeRootSession = async (rhs: DeepPartial<SessionStore>) => {

        const newSettings = deepMerge<DeepPartial<SessionStore>>(store, rhs, { arrayMerge: overwriteMerge });

        Object.assign(store, newSettings);

        events.dispatchEvent(new SessionChangeEvent(store, rhs));

    }


    // keep the session up to date with user changed settings
    useSettingsStore.subscribe(settings => {
        mergeRootSession({
            audio: settings.data.audio,
            game: settings.data.game,
            postprocessing: settings.data.postprocessing,
            postprocessing3d: settings.data.postprocessing3d,
        })
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
            lSet<SessionVariables>(acc, settingsKey, defineSessionProperty(value, settingsKey))
        }
        return acc;
    }, {})) as SessionVariables;

    const getRawValue = (path: string[]) => lGet(store, path);

    // A macro has defined the session field it is interested in
    const doAction = async (action: MacroActionHostModifyValue) => {

        const field = getSessionSettingsField(store, action.field!);

        if (field) {
            applyEffectToSessionRoot(action.effect, action.field!, field, action.value);
        }

    }

    const getState = () => store;

    return { getRawValue, sessionVars, doAction, getState, dispose: () => janitor.dispose(), events };
}
