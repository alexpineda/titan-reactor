import { ipcRenderer } from "electron";
import { handles } from "./handlers";
const path = window.require("path");
const { app } = window.require("electron");

export const getAppCachePath = async (folder) => {
  return path.join(app.getPath("appData"), folder);
  //fuck electron1
  //return await ipcRenderer.invoke(handles.getAppCachePath, folder);
};
