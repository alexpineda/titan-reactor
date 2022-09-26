import create from "zustand";

import { Settings, SettingsMeta } from "common/types";
import { defaultSettings } from "common/default-settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";

export type SettingsStore = SettingsMeta & {
  save: (data: Partial<Settings>) => Promise<SettingsMeta>;
  set: (data: Partial<Settings>) => Promise<void>;
  load: () => Promise<SettingsMeta>;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  data: { ...defaultSettings },
  phrases: {},
  isCascStorage: false,
  errors: [],
  enabledPlugins: [],
  disabledPlugins: [],
  pluginsMetadata: [],
  initialInstall: false,
  set: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
  },
  save: async (settings) => {
    await saveSettings({ ...get().data, ...settings });
    return await get().load();
  },
  load: async () => {
    const settings = await invokeGetSettings();
    set(settings);
    return settings;
  },

}));

export const settingsStore = () => useSettingsStore.getState();