import { getSettings as invokeGetSettings, saveSettings } from "../invoke";
import create from "zustand";

//a user settings store which persists to disk

const useSettingsStore = create((set, get) => ({
  data: {},
  phrases: {},
  save: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data);
    set(await invokeGetSettings());
  },
  load: async () => {
    set(await invokeGetSettings());
  },
}));

export default useSettingsStore;

export const getSettings = () => useSettingsStore.getState().data;
