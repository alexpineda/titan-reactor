import create from "zustand";

import { SettingsMeta } from "common/types";
import { defaultSettings } from "common/settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";


export type SettingsStore = SettingsMeta & {
  save: (data: any) => Promise<void>;
  load: () => Promise<SettingsMeta>;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  data: { ...defaultSettings },
  phrases: {},
  isCascStorage: false,
  errors: [],
  enabledPlugins: [],
  disabledPlugins: [],
  save: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data);
  },
  load: async () => {
    const settings = await invokeGetSettings() as SettingsMeta;
    set(settings);
    return settings;
  },
}));


export default () => useSettingsStore.getState();