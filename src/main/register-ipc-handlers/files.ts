import { ipcMain } from "electron";

import { LOAD_DAT_FILES, OPEN_FILE } from "common/ipc-handle-names";
import { promises as fsPromises } from "fs";
import settings from "../settings/singleton";
import { loadDATFiles } from "common/bwdat/load-dat-files";
import { openCascStorage, readCascFile } from "common/casclib";

ipcMain.handle(OPEN_FILE, async (_, filepath = "") => {
  try {
    return await fsPromises.readFile(filepath);
  } catch (e) {
    return null;
  }
});

ipcMain.handle(LOAD_DAT_FILES, async () => {

  await openCascStorage(settings.get().directories.starcraft);

  return await loadDATFiles(readCascFile)

});