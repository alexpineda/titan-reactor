import create, { GetState, SetState } from "zustand";

import { Settings, MacroAction, MacroActionType } from "common/types";
import { getMacroActionValue } from "../command-center/macros";
import { getAppSettingsLevaConfigField } from "common/get-app-settings-leva-config";
import { diff } from "deep-diff"
import deepMerge from 'deepmerge';
import { DeepPartial } from "common/types";
import lSet from "lodash.set";
import settingsStore from "./settings-store";

export type SessionStore = Settings & {
    minimapScale: number;
    merge: (rhs: DeepPartial<Settings>) => void;
    doMacroAction: (action: MacroAction) => void;
}

const overwriteMerge = (_: any, sourceArray: any) => sourceArray;

const _createSession = (ogData: Settings) => create<SessionStore>((set: SetState<SessionStore>, get: GetState<SessionStore>) => ({
    ...JSON.parse(JSON.stringify(ogData)),
    minimapScale: 1,
    merge: async (rhs: DeepPartial<Settings>) => {

        const newSettings = deepMerge<DeepPartial<Settings>>(get(), rhs, { arrayMerge: overwriteMerge });
        const d = diff(get(), newSettings);
        console.log(d ?? "no diff");
        //@ts-ignore
        set({ ...newSettings });
    },
    doMacroAction: async (action) => {
        if (action.type !== MacroActionType.ModifyAppSettings) {
            return;
        }
        console.log('settings-store.doMacroAction', action.value);

        const field = getAppSettingsLevaConfigField({ data: get(), enabledPlugins: settingsStore().enabledPlugins }, action.field!) as any;
        if (field === undefined) {
            return;
        }

        const value = getMacroActionValue(action, field.value, field.step, field.min, field.max, field.options);
        const newSettings = {};
        lSet(newSettings, action.field!, value);
        get().merge(newSettings);
    }
}));

export const createSession = () => _createSession(settingsStore().data);