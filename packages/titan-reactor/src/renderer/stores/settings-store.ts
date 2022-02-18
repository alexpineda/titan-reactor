import create from "zustand";

import { Settings, Plugin } from "../../common/types";
import { defaultSettings } from "../../common/settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";
import { initializePlugins, disposePlugins } from "../plugin-api/initialize-api";

export type SettingsMeta = {
  data: Settings;
  errors: string[];
  phrases: Record<string, string>;
  plugins: Plugin[];
  /**
   * Whether the starcraft directory is a CASC storage or direct filesystem
   */
  isCascStorage: boolean;
};

export type SettingsStore = SettingsMeta & {
  save: (data: any) => Promise<void>;
  load: () => Promise<void>;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  data: { ...defaultSettings },
  phrases: {},
  isCascStorage: false,
  errors: [],
  plugins: [],
  save: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data);
  },
  load: async () => {
    disposePlugins(get().plugins);
    const settings = await invokeGetSettings();
    initializePlugins(settings.plugins);
    set(settings);
  },
}));


export default useSettingsStore;

export const getSettings = () => useSettingsStore.getState().data;
export const loadSettings = useSettingsStore.getState().load;
export const isCascStorage = () => useSettingsStore.getState().isCascStorage;
