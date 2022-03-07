import { ipcRenderer } from "electron";

import { GET_SETTINGS, SET_SETTINGS } from "common/ipc-handle-names";
import { Settings } from "common/types";

export const getSettings = async () => {
  return await ipcRenderer.invoke(GET_SETTINGS);
};

export const saveSettings = async (settings: Settings) => {
  return await ipcRenderer.invoke(SET_SETTINGS, settings);
};
