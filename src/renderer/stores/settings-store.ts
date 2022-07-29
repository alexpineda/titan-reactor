import create from "zustand";

import { Settings, SettingsMeta, MacroAction, MacroActionType } from "common/types";
import { defaultSettings } from "common/settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";
import { getMacroActionValue } from "../command-center/macros";
import { getAppSettingsLevaConfigField } from "common/get-app-settings-leva-config";
import deepMerge from "deepmerge"
import lSet from "lodash.set";
import { DeepPartial } from "common/types";

export type SettingsStore = SettingsMeta & {
  save: (data: Partial<Settings>, source: string) => Promise<SettingsMeta>;
  set: (data: Partial<Settings>, source: string) => Promise<void>;
  merge: (data: DeepPartial<Settings>, source: string) => Promise<void>;
  load: () => Promise<SettingsMeta>;
  doMacroAction: (action: MacroAction) => void;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  data: { ...defaultSettings },
  phrases: {},
  isCascStorage: false,
  errors: [],
  enabledPlugins: [],
  disabledPlugins: [],
  pluginsMetadata: [],
  set: async (settings, source: string) => {
    set((state) => ({ data: { ...state.data, ...settings, source } }));
  },
  merge: async (settings, source: string) => {
    //TODO FIX TYPES
    //@ts-ignore
    set((state) => ({ data: deepMerge(state.data, settings), source }));
  },
  save: async (settings, source: string) => {
    set({ data: { ...get().data, ...settings, source } });
    const data = await saveSettings({ ...get().data, ...settings, source });
    set({ data });
    return await invokeGetSettings();
  },
  load: async () => {
    const settings = await invokeGetSettings();
    set(settings);
    return settings;
  },
  doMacroAction: async (action) => {
    if (action.type !== MacroActionType.ModifyAppSettings) {
      return;
    }

    const field = getAppSettingsLevaConfigField(get(), action.field!) as any;
    if (field === undefined) {
      return;
    }

    const value = getMacroActionValue(action, field.value, field.step, field.min, field.max, field.options);
    const newSettings = { ...get().data };
    lSet(newSettings, action.field!, value);
    get().set(newSettings, "settings-store:doMacroAction");
  }
}));


export default () => useSettingsStore.getState();