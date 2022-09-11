
import { SettingsMeta, OpenBW, FieldDefinition, MacroActionEffect } from "common/types";
import { doMacroActionEffect } from "@macros";
import { fromNestedToSessionLevaConfig, fromnNestedToSessionLevaField } from "common/get-app-settings-leva-config";
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import lGet from "lodash.get";
import settingsStore, { SettingsStore, useSettingsStore } from "./settings-store";
import { diff } from "deep-diff";
import * as log from "@ipc/log";
import { UseStore } from "zustand";
import produce from 'immer';
import { SessionStore, MergeSessiomStore } from "./session-store";

export const applyEffectToSessionProperty = (merge: MergeSessiomStore, effect: MacroActionEffect, path: string[], field: FieldDefinition, newValue: any, resetValue: any, beforeSet?: (newValue: any, field: FieldDefinition) => boolean | void) => {

    let value = doMacroActionEffect(effect, field, newValue, resetValue);

    if (beforeSet && beforeSet(value, field) === false) {
        return;
    }

    const newSettings = {};
    lSet(newSettings, path, value);
    merge(newSettings);

}

export const getSessionSettingsField = (sessionStore: SessionStore, path: string[]) => {

    const field = fromnNestedToSessionLevaField(sessionStore, settingsStore().enabledPlugins, path) as FieldDefinition | undefined;

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

export const createReactiveSessionApi = (useSessionStore: UseStore<SessionStore>, merge: MergeSessiomStore, openBW: OpenBW) => {

    const sessionSettingsConfig = fromNestedToSessionLevaConfig(settingsStore().data, settingsStore().enabledPlugins);

    const sessionVars = {
        sandboxMode: defineReactiveProperty(false, ["sandboxMode"], (newValue) => {
            return openBW.setSandboxMode(newValue) !== undefined;
        }),
    };

    //TODO: do the same for plugin settings
    for (const [key, obj] of Object.entries(sessionSettingsConfig)) {
        if (isValidkey(key)) {
            lSet(sessionVars, key.split("."), defineReactiveProperty(obj.value, key.split(".")))
        }
    }

    const userVars: {
        [key in string]: ReturnType<typeof defineReactiveProperty>;
    } = {
    };

    const sessionApi: {
        getState: () => SessionStore;
        defineVariable: (name: string, definition: FieldDefinition | {}, beforeSet?: (newValue: any, field: FieldDefinition) => boolean | void,) => void;

    } = {
        getState: () => useSessionStore.getState(),
        defineVariable: (name: string, definition: FieldDefinition | {}, beforeSet?: (newValue: any, field: FieldDefinition) => boolean | void,) => {

            if (name in userVars) {
                log.warning(`Session variable ${name} already exists.`);
                return;
            }

            userVars[name as keyof typeof sessionVars] = defineReactiveProperty(definition, ["userVars", name], beforeSet);

        }
    }

    function isFieldDefinition(value: any): value is FieldDefinition {
        return value !== undefined && value !== null && value.hasOwnProperty("value")
    }

    function defineReactiveProperty(definition: FieldDefinition | {}, path: string[], beforeSet?: (newValue: any, field: FieldDefinition) => boolean | void, onDelete?: () => void) {

        const field = isFieldDefinition(definition) ? definition : { value: definition };

        const apply = (effect: MacroActionEffect, newValue?: any, resetValue?: any) => {

            applyEffectToSessionProperty(merge, effect, path, field, newValue, resetValue, beforeSet);

        }

        return {
            update(fn: (value: any) => any) {
                this.value = produce(fn, this.value);
            },
            /**
             * Get value of the property.
             */
            get value() {
                return lGet(useSessionStore.getState(), path);
            },
            /**
             * Set value of the property.
             */
            set value(newValue: any) {
                apply(MacroActionEffect.Set, newValue);
            },
            /**
             * Increase the value of the property.
             */
            inc: () => apply(MacroActionEffect.Increase),
            /**
             * Increase the value of the property. Loop around if the value is greater than the maximum.
             */
            incCycle: () => apply(MacroActionEffect.IncreaseCycle),
            /**
             * Decrease the value of the property.
             */
            dec: () => apply(MacroActionEffect.Decrease),
            /**
             * Decrease the value of the property. Loop around if the value is less than the minimum.
             */
            decCycle: () => apply(MacroActionEffect.DecreaseCycle),
            /**
             * Set the value of the property to the minimum.
             */
            min: () => apply(MacroActionEffect.Min),
            /**
             * Set the value of the property to the maximum.
             */
            max: () => apply(MacroActionEffect.Max),
            /**
             * Reset the value of the property to the default.
             */
            reset: () => apply(MacroActionEffect.SetToDefault),
            /**
             * Reset the value of the property to the default.
             */
            toggle: () => apply(MacroActionEffect.Toggle),
            /**
             * Delete the property.
             */
            delete: onDelete
        }

    }

    return { sessionApi, sessionVars, userVars, defineReactiveProperty };
}

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
                const parentProp = lGet(settings, d.path.slice(0, d.path.length - 1));
                // don't diff down to array elements, just the entire array is fine!
                // otherwise we're left with a sparse array :(
                if (Array.isArray(parentProp) && typeof d.path[d.path.length - 1] === "number") {
                    lSet(parentProp, d.path, d.rhs);
                    lSet(mergeSettings, d.path.slice(0, d.path.length - 1), parentProp);
                } else {
                    lSet(mergeSettings, d.path, d.rhs);
                }
            }
        }

        onNewSettings(mergeSettings, settings, prevSettings)
    })

