import create, { GetState, SetState } from "zustand";

import { Settings, MacroAction, MacroActionType, SettingsMeta } from "common/types";
import { doMacroActionEffect } from "@macros";
import { getAppSettingsLevaConfigField } from "common/get-app-settings-leva-config";
import deepMerge from 'deepmerge';
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import settingsStore, { SettingsStore, useSettingsStore } from "./settings-store";
import Janitor from "@utils/janitor";
import { diff } from "deep-diff";
import set from "lodash.set";
import * as log from "@ipc/log";

export type SessionStore = Settings & {
    minimapScale: number;
    merge: (rhs: DeepPartial<Settings>) => void;
    doMacroAction: (action: MacroAction) => void;
}

const overwriteMerge = (_: any, sourceArray: any) => sourceArray;

export const createSession = (ogData: Settings) => {
    return create<SessionStore>((set: SetState<SessionStore>, get: GetState<SessionStore>) => ({
        ...JSON.parse(JSON.stringify(ogData)),
        minimapScale: 1,
        merge: async (rhs: DeepPartial<Settings>) => {

            const newSettings = deepMerge<DeepPartial<Settings>>(get(), rhs, { arrayMerge: overwriteMerge });
            //@ts-ignore
            set({ ...newSettings });
        },
        doMacroAction: async (action) => {
            if (action.type !== MacroActionType.ModifyAppSettings) {
                log.warning("@settingsStore.doMacroAction. Macro type is invalid.");
                return;
            }

            const field = getAppSettingsLevaConfigField({ data: get(), enabledPlugins: settingsStore().enabledPlugins }, action.field!) as any;
            if (field === undefined) {
                log.warning("@settingsStore.doMacroAction. Settings field is no found.");
                return;
            }

            
            const existingValue = field.value;
            let value = doMacroActionEffect(action, existingValue, field.value, field.step, field.min, field.max, field.options );

            const newSettings = {};
            lSet(newSettings, action.field!, value);
            get().merge(newSettings);
        }
    }));
};

export const listenForNewSettings = (onNewSettings: (mergeSettings: DeepPartial<SettingsMeta>, settings: SettingsStore, prevSettings: SettingsStore) => void) => {
    return new Janitor(useSettingsStore.subscribe((settings, prevSettings) => {

        const diffs = diff(prevSettings, settings);
        if (diffs === undefined)
            return;

        // update our session with the new user manipulated settings
        const mergeSettings: DeepPartial<SettingsMeta> = {
            data: {}
        };
        for (const d of diffs) {
            if (d.kind === "E" && d.path) {
                set(mergeSettings, d.path, d.rhs);
            }
        }

        onNewSettings(mergeSettings, settings, prevSettings)
    }));
}
