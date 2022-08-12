import { ipcMain } from "electron";

import { LOG_MESSAGE } from "../../common/ipc-handle-names";
import { logService } from "../logger/singleton";

ipcMain.on(LOG_MESSAGE, (_, { level, message }) => {
  logService.log(level, message);
});
