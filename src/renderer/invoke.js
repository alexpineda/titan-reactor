import { ipcRenderer } from "electron";
import handles from "../common/handleNames";

export const getAppCachePath = async (folder) => {
  return await ipcRenderer.invoke(handles.getAppCachePath, folder);
};

export const openFile = async (filepath) => {
  const result = await ipcRenderer.invoke(handles.openFile, filepath);
  return new Buffer(result);
};

export const loadAllDataFiles = async (bwDataPath) => {
  return await ipcRenderer.invoke(handles.loadAllDataFiles, bwDataPath);
};
