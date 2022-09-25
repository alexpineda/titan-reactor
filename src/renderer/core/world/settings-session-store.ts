import { SessionSettingsData, Settings } from "common/types";
import {
    getSessionSettingsInLevaFormat,
    getSessionSettingsPropertyInLevaFormat,
} from "common/get-app-settings-leva-config";
import lSet from "lodash.set";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";
import { createResettableStore } from "@stores/resettable-store";
import { createOperatableStore, MutationVariable } from "@stores/operatable-store";

type ValidAppSessionPath = `${keyof SessionSettingsData}.`;
const validAppSettingsPaths: ValidAppSessionPath[] = [
    "audio.",
    "input.",
    "postprocessing.",
    "postprocessing3d.",
    "minimap.",
];

const isValidkey = (key: string) => {
    for (const path of validAppSettingsPaths) {
        if (key.startsWith(path)) {
            return true;
        }
    }
};

export type SessionVariables = {
    [K in keyof SessionSettingsData]: {
        [T in keyof SessionSettingsData[K]]: MutationVariable;
    };
};

const partialSettings = (data: Settings) => ({
    audio: data.audio,
    input: data.input,
    minimap: data.minimap,
    postprocessing: data.postprocessing,
    postprocessing3d: data.postprocessing3d,
});

export type SettingsSessionStore = ReturnType<
    typeof createSettingsSessionStore
>;
/**
 * An api that allows the consumer to modify setting values and have the system respond, eg fog of war level.
 */
export const createSettingsSessionStore = (
    events: TypeEmitter<WorldEvents>
) => {
    const janitor = new Janitor("ReactiveSessionVariables");

    const store = createOperatableStore(
        createResettableStore({
            sourceOfTruth: partialSettings(settingsStore().data),
            validateMerge: (newSettings, rhs) =>
                events.emit("settings-changed", { settings: newSettings, rhs }) !==
                false,
        }),
        (path, state) =>
            getSessionSettingsPropertyInLevaFormat(
                state,
                settingsStore().enabledPlugins,
                path
            )
    );

    // keep the session up to date with user changed settings
    janitor.mop(
        useSettingsStore.subscribe(({ data }) => {
            store.updateSourceOfTruth(partialSettings(data));
        }),
        "settings-store-subscription"
    );

    const sessionSettingsConfig = getSessionSettingsInLevaFormat(
        settingsStore().data,
        settingsStore().enabledPlugins
    );

    const vars = Object.keys(sessionSettingsConfig).reduce((acc, key) => {
        if (isValidkey(key)) {
            const settingsKey = key.split(".");
            lSet<SessionVariables>(
                acc,
                settingsKey,
                store.createVariable(settingsKey)
            );
            lSet<SessionVariables>(
                acc,
                [
                    `get${settingsKey
                        .map((t) => t[0].toUpperCase() + t.slice(1))
                        .join("")}`,
                ],
                () => store.getValue(settingsKey)
            );
        }
        return acc;
    }, {}) as SessionVariables;

    return {
        ...store,
        vars,
        dispose: () => janitor.dispose(),
    };
};
