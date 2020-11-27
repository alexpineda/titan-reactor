import { ipcRenderer } from "electron";
import {
  GET_APPCACHE_PATH,
  OPEN_FILE,
  LOAD_ALL_DATA_FILES,
  SET_SETTINGS,
  GET_SETTINGS,
  SELECT_FOLDER,
} from "../common/handleNames";
import { Buffer } from "buffer/";

export const getAppCachePath = async (folder = "") => {
  return ipcRenderer.invoke(GET_APPCACHE_PATH, folder);
};

export const openFile = async (filepath) => {
  const result = await ipcRenderer.invoke(OPEN_FILE, filepath);
  return new Buffer(result);
};

export const loadAllDataFiles = async (bwDataPath) => {
  return Object.freeze(
    await ipcRenderer.invoke(LOAD_ALL_DATA_FILES, bwDataPath)
  );
};

export const selectFolder = async (key) => {
  return await ipcRenderer.invoke(SELECT_FOLDER, key);
};

export const getSettings = async (settings) => {
  return await ipcRenderer.invoke(GET_SETTINGS, settings);
};

export const saveSettings = async (settings) => {
  return await ipcRenderer.invoke(SET_SETTINGS, settings);
};

export const openMapDialog = async (settings) => {
  return await ipcRenderer.invoke(SET_SETTINGS, settings);
};

export const openReplayDialog = async (settings) => {
  return await ipcRenderer.invoke(SET_SETTINGS, settings);
};
