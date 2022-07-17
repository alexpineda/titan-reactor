import { ipcRenderer } from "electron";

import { GET_LOADED_SETTINGS, SET_SETTINGS_FROM_CONFIGW } from "common/ipc-handle-names";
import { Settings } from "common/types";

export const getSettings = async () => {
  return await ipcRenderer.invoke(GET_LOADED_SETTINGS);
};

export const saveSettings = async (settings: Settings) => {
  //@ts-ignore
  if (!window.isTitanReactorConfig) {
    throw new Error("This window is not a Titan Reactor config window");
  }
  return await ipcRenderer.invoke(SET_SETTINGS_FROM_CONFIGW, settings);
};
