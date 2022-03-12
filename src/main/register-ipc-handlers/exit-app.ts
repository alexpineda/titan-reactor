import { app, ipcMain } from "electron";

import { EXIT } from "../../common/ipc-handle-names";

ipcMain.on(EXIT, () => {
  app.exit(0);
});
