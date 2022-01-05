import create from "zustand";

import { Settings } from "../../common/types";
import { defaultSettings } from "../../common/settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";

export type SettingsStore = {
  data: Settings;
  errors: string[];
  phrases: Record<string, string>;
  isDev: boolean;
  isCascStorage: boolean;
  save: (data: any) => Promise<void>;
  load: () => Promise<void>;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  isDev: false,
  data: { ...defaultSettings },
  phrases: {},
  isCascStorage: false,
  errors: [],
  save: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data);
    set(await invokeGetSettings());
  },
  load: async () => {
    const settings = await invokeGetSettings();
    set(settings);
  },
}));

export default useSettingsStore;

export const getSettings = () => useSettingsStore.getState().data;
export const loadSettings = useSettingsStore.getState().load;
export const isCascStorage = () => useSettingsStore.getState().isCascStorage;
