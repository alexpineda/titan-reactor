import { ipcRenderer } from "electron";
import handles from "../common/handleNames";
import path from "path";
import { app } from "electron";

export const getAppCachePath = async (folder) => {
  // return path.join(app.getPath("appData"), folder);
  //fuck electron1
  return await ipcRenderer.invoke(handles.getAppCachePath, folder);
};

export const openFile = async (filepath) => {
  // return path.join(app.getPath("appData"), folder);
  //fuck electron1
  return await ipcRenderer.invoke(handles.openFile, filepath);
};
