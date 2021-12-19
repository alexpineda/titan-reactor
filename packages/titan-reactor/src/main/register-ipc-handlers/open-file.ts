import { ipcMain } from "electron";

import { OPEN_FILE } from "../../common/ipc-handle-names";
import { readFile } from "../utils/read-file";

ipcMain.handle(OPEN_FILE, async (_, filepath = "") => {
  return await readFile(filepath);
});
