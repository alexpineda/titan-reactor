import { ipcMain, app } from "electron";
import fs from "fs";
import { openFileBinary } from "./fs";
import path from "path";
import { getAppCachePath, openFile } from "../common/handleNames";

ipcMain.handle(getAppCachePath, async (event, folder = "") => {
  return path.join(app.getPath("appData"), folder);
});

ipcMain.handle(openFile, async (event, filepath = "") => {
  return openFileBinary(filepath);
});
