import { app, ipcMain } from "electron";

import { EXIT, LOG_MESSAGE } from "../../common/ipc";
import { logger } from "../common";

ipcMain.on(LOG_MESSAGE, (_, { level, message }) => {
  logger.log(level, message);
});

ipcMain.on(EXIT, () => {
  app.exit(0);
});
