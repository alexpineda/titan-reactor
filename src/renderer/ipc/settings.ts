import { ipcRenderer } from "electron";

import { GET_LOADED_SETTINGS, SAVE_SETTINGS_DATA } from "common/ipc-handle-names";
import { Settings } from "common/types";

export const getSettings = async () => {
  return await ipcRenderer.invoke(GET_LOADED_SETTINGS);
};

export const saveSettings = async (settings: Settings) => {
  return await ipcRenderer.invoke(SAVE_SETTINGS_DATA, settings);
};
