import { ipcMain, app } from "electron";
import fs from "fs";
import path from "path";

const getAppCachePath = "getAppCachePath";

ipcMain.handle(getAppCachePath, async (event, folder = "") => {
  debugger;
  return path.join(app.getPath("appData"), folder);
});

export const handles = {
  getAppCachePath,
};
