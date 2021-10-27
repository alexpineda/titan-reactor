import create from "zustand";

import { Settings } from "../../common/types/common";
import { getSettings as invokeGetSettings, saveSettings } from "../invoke";

//a user settings store which persists to disk
type SettingsStore = {
  data: Settings | null;
  errors: string[];
  phrases: any;
  save: (data: any) => Promise<void>;
  load: () => Promise<void>;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  data: null,
  phrases: {},
  errors: [],
  save: async (settings) => {
    console.log("saving settings data");
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data);
    set(await invokeGetSettings());
  },
  load: async () => {
    const { data, errors, phrases } = await invokeGetSettings();
    console.log("got settings", data, errors, phrases);
    set({ data, errors, phrases });
    console.log("set settings", get());
  },
}));

export default useSettingsStore;

export const getSettings = () => useSettingsStore.getState().data;
