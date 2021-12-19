import { ipcMain } from "electron";

import {
  OPEN_CASCLIB,
  OPEN_CASCLIB_FILE,
  CLOSE_CASCLIB,
} from "../../../common/ipc-handle-names";

import * as casclib from "./api";

ipcMain.handle(OPEN_CASCLIB, (_, bwPath) => {
  try {
    casclib.openCascStorage(bwPath);
    return true;
  } catch (e) {
    return false;
  }
});

ipcMain.handle(OPEN_CASCLIB_FILE, async (_, filepath) => {
  return await casclib.readCascFile(filepath);
});

ipcMain.handle(CLOSE_CASCLIB, () => {
  casclib.closeCascStorage();
});
