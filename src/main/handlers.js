import { ipcMain, app } from "electron";
import fs from "fs";
import { openFileBinary } from "./fs";
import path from "path";
import {
  getAppCachePath,
  openFile,
  loadAllDataFiles as loadAllDataFilesHandler,
} from "../common/handleNames";
import { loadAllDataFiles } from "./units/loadAllDataFiles";

ipcMain.handle(getAppCachePath, async (event, folder = "") => {
  return path.join(app.getAppPath(), folder);
});

ipcMain.handle(openFile, async (event, filepath = "") => {
  return await openFileBinary(filepath);
});

ipcMain.handle(loadAllDataFilesHandler, async (event, bwDataPath) => {
  return await loadAllDataFiles(bwDataPath);
});
