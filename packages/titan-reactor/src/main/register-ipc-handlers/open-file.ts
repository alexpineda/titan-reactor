import { ipcMain } from "electron";

import { OPEN_FILE } from "../../common/ipc-handle-names";
import { promises as fsPromises } from "fs";

ipcMain.handle(OPEN_FILE, async (_, filepath = "") => {
  try {
    return await fsPromises.readFile(filepath);
  } catch (e) {
    return null;
  }
});
