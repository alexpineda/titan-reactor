import create from "zustand";

import { Settings, InitializedPluginJSON, GlobalPluginConfig as PluginSystemConfig } from "../../common/types";
import { defaultSettings } from "../../common/settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";

export type SettingsMeta = {
  data: Settings;
  errors: string[];
  phrases: Record<string, string>;
  pluginsConfigs: InitializedPluginJSON[];
  pluginSystemConfig: PluginSystemConfig;
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
  pluginsConfigs: [],
  pluginSystemConfig: {
    respository: [],
    disabled: [],
    slots: [],
    theme: []
  },
  save: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data);
  },
  load: async () => {
    const settings = await invokeGetSettings() as SettingsMeta;
    set(settings);
  },
}));


export default () => useSettingsStore.getState();