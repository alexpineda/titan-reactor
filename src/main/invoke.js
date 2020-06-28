import { ipcRenderer } from "electron";
import { handles } from "./handlers";
import path from "path";
import { app } from "electron";

export const getAppCachePath = async (folder) => {
  return path.join(app.getPath("appData"), folder);
  //fuck electron1
  //return await ipcRenderer.invoke(handles.getAppCachePath, folder);
};
