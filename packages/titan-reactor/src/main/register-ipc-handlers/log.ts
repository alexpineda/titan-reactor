import { ipcMain } from "electron";

import { LOG_MESSAGE } from "../../common/ipc-handle-names";
import logger from "../logger/singleton";

ipcMain.on(LOG_MESSAGE, (_, { level, message }) => {
  logger.log(level, message);
});
