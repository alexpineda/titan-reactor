import create from "zustand";

import { Settings } from "../../common/types";
import { defaultSettings } from "../../common/settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";

export type SettingsStore = {
  data: Settings;
  errors: string[];
  phrases: Record<string, string>;
  save: (data: any) => Promise<void>;
  load: () => Promise<void>;
  getSettings: () => Settings;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  data: { ... defaultSettings },
  phrases: {},
  errors: [],
  save: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data as Settings);
    set(await invokeGetSettings());
  },
  load: async () => {
    const { data, errors, phrases } = await invokeGetSettings();
    set({ data, errors, phrases });
  },
  getSettings: () => {
    const settings = get().data;
    if (!settings) {
      throw new Error("Settings not loaded");
    }
    return settings;
  },
}));

export default useSettingsStore;

export const getSettings = useSettingsStore.getState().getSettings;
export const loadSettings = useSettingsStore.getState().load;
