import { getSettings, saveSettings } from "../invoke";
import create from "../../../libs/zustand";

//a user settings store which persists to disk

const useSettingsStore = create((set, get) => ({
  data: {},
  phrases: {},
  save: async (settings) => {
    set((state) => ({ data: { ...state.data, ...settings } }));
    await saveSettings(get().data);
    set(await getSettings());
  },
  load: async () => {
    set(await getSettings());
  },
}));

export default useSettingsStore;
