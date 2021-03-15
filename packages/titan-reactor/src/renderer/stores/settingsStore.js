import { getSettings, saveSettings } from "../invoke";
import create from "../../../libs/zustand";

const useSettingsStore = create((set, get) => ({
  data: {},
  phrases: {},
  save: async (settings) => {
    set({ data: { ...get().data, ...settings } });
    await saveSettings(get().data);
  },
  load: async () => {
    set(await getSettings());
  },
}));

export default useSettingsStore;