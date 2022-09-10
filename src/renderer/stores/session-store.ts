import create, { GetState, SetState } from "zustand";

import { Settings, MacroAction, MacroActionType, SettingsMeta, OpenBW } from "common/types";
import { doMacroActionEffect } from "@macros";
import { getAppSettingsLevaConfigField } from "common/get-app-settings-leva-config";
import deepMerge from 'deepmerge';
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import settingsStore, { SettingsStore, useSettingsStore } from "./settings-store";
import { diff } from "deep-diff";
import set from "lodash.set";
import getProp from "lodash.get";
import * as log from "@ipc/log";
import { BasePlayer } from "@core/players";

export type SessionStore = Settings & {
    minimapScale: number;
    merge: (rhs: DeepPartial<Settings>) => void;
    doMacroAction: (action: MacroAction) => void;
    players: BasePlayer[];
    sandboxMode: boolean;
}

const overwriteMerge = (_: any, sourceArray: any) => sourceArray;

export const createSession = (ogData: Settings, players: BasePlayer[], openBw: OpenBW) => {
    return create<SessionStore>((set: SetState<SessionStore>, get: GetState<SessionStore>) => ({

        ...JSON.parse(JSON.stringify(ogData)),
        players,
        minimapScale: 1,
        get sandboxMode() {
            return openBw.isSandboxMode();
        },
        set sandboxMode(value: boolean) {
            openBw.setSandboxMode(value);
        },
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
            let value = doMacroActionEffect(action, existingValue, field.value, field.step, field.min, field.max, field.options);

            const newSettings = {};
            lSet(newSettings, action.field!, value);
            get().merge(newSettings);

        }

    }));
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

