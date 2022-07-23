import create from "zustand";

import { Settings, SettingsMeta } from "common/types";
import { defaultSettings } from "common/settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";
import { getMacroActionValue, MacroAction, MacroActionType } from "../command-center/macros";
import { getAppSettingsLevaConfigField } from "../command-center/global-settings";

import lSet from "lodash.set";

export type SettingsStore = SettingsMeta & {
  save: (data: Partial<Settings>) => Promise<void>;
  set: (data: Partial<Settings>) => Promise<void>;
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
  set: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
  },
  save: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data);
  },
  load: async () => {
    const settings = await invokeGetSettings() as SettingsMeta;
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

    const value = getMacroActionValue(action, field.value, field.step, field.min, field.max);
    const newSettings = { ...get().data };
    lSet(newSettings, action.field!, value);
    get().set(newSettings);
  }
}));


export default () => useSettingsStore.getState();