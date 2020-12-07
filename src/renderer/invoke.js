import { ipcRenderer } from "electron";
import {
  GET_APPCACHE_PATH,
  OPEN_FILE,
  OPEN_DATA_FILE,
  LOAD_ALL_DATA_FILES,
  SET_SETTINGS,
  GET_SETTINGS,
  SELECT_FOLDER,
  LOG_MESSAGE,
  SET_WEBGL_CAPABILITIES,
  EXIT,
} from "../common/handleNames";
import { Buffer } from "buffer/";

export const getAppCachePath = async (folder = "") => {
  return ipcRenderer.invoke(GET_APPCACHE_PATH, folder);
};

export const openFile = async (filepath) => {
  const result = await ipcRenderer.invoke(OPEN_FILE, filepath);
  return new Buffer(result);
};

export const openDataFile = async (filepath) => {
  const result = await ipcRenderer.invoke(OPEN_DATA_FILE, filepath);
  return new Buffer(result);
};

export const loadAllDataFiles = async (bwDataPath) => {
  return Object.freeze(
    await ipcRenderer.invoke(LOAD_ALL_DATA_FILES, bwDataPath)
  );
};

export const selectFolder = async (key) => {
  return await ipcRenderer.send(SELECT_FOLDER, key);
};

export const getSettings = async (settings) => {
  return await ipcRenderer.invoke(GET_SETTINGS, settings);
};

export const saveSettings = async (settings) => {
  return await ipcRenderer.invoke(SET_SETTINGS, settings);
};

// export const openMapDialog = async (settings) => {
//   return await ipcRenderer.invoke(SET_SETTINGS, settings);
// };

// export const openReplayDialog = async (settings) => {
//   return await ipcRenderer.invoke(SET_SETTINGS, settings);
// };

export const log = async (message, level = "info") => {
  return await ipcRenderer.send(LOG_MESSAGE, { level, message });
};

export const setWebGLCapabilities = async (capabilities) => {
  return await ipcRenderer.invoke(SET_WEBGL_CAPABILITIES, capabilities);
};

export const exit = () => {
  ipcRenderer.send(EXIT);
};
