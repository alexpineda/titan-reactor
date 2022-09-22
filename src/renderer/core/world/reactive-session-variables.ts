
import { FieldDefinition, SessionSettingsData, MacroActionHostModifyValue, Settings } from "common/types";
import { MutationVariable } from "@macros/create-mutate-effect-store";
import { getSessionSettingsInLevaFormat, getSessionSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import lGet from "lodash.get";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";
import { createSessionStore } from "./session-store";
import { createMutationStore } from "./mutation-store";

export type MergeSessionStore = (rhs: DeepPartial<SessionSettingsData>) => void;

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
        [T in keyof SessionSettingsData[K]]: MutationVariable
    };
}

export type ReactiveSessionVariables = ReturnType<typeof createReactiveSessionVariables>;
/**
 * An api that allows the consumer to modify setting values and have the system respond, eg fog of war level.
 */
export const createReactiveSessionVariables = (events: TypeEmitter<WorldEvents>) => {

    const janitor = new Janitor("ReactiveSessionVariables");

    const copyFromSettings = (data: Settings) => ({
        audio: data.audio,
        input: data.input,
        minimap: data.minimap,
        postprocessing: data.postprocessing,
        postprocessing3d: data.postprocessing3d,
    })
    const sourceOfTruth = copyFromSettings(settingsStore().data);

    const store = createSessionStore({
        sourceOfTruth,
        validateMerge: (newSettings, rhs) => events.emit("settings-changed", { settings: newSettings, rhs }) !== false,
    });

    const mutation = createMutationStore(store, (state, path) => getSessionSettingsPropertyInLevaFormat(state, settingsStore().enabledPlugins, path) as FieldDefinition | undefined)

    // keep the session up to date with user changed settings
    janitor.mop(useSettingsStore.subscribe(({ data }) => {

        store.merge(data);
        Object.assign(sourceOfTruth, copyFromSettings(data));

    }), "settings-store-subscription");


    const sessionSettingsConfig = getSessionSettingsInLevaFormat(settingsStore().data, settingsStore().enabledPlugins);

    const vars = (Object.keys(sessionSettingsConfig).reduce((acc, key) => {
        if (isValidkey(key)) {
            const settingsKey = key.split(".");
            lSet<SessionVariables>(acc, settingsKey, mutation.createVariable(settingsKey));
            lSet<SessionVariables>(acc, [`get${settingsKey.map(t => t[0].toUpperCase() + t.slice(1)).join("")}`], () => lGet(store, settingsKey));
        }
        return acc;
    }, {})) as SessionVariables;

    const mutate = async (action: MacroActionHostModifyValue) => {

        mutation.mutate(action);

    }

    const getState = () => store.getState();
    const getRawValue = store.getValue;

    return { getRawValue, vars, mutate, getState, dispose: () => janitor.dispose() };
}
