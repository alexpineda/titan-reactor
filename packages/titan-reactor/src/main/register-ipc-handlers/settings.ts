import { ipcMain } from "electron";

import { GET_SETTINGS, SET_SETTINGS } from "../../common/ipc-handle-names";
import settings from "../settings/singleton";

ipcMain.handle(GET_SETTINGS, async () => {
  return await settings.getMeta();
});

ipcMain.handle(SET_SETTINGS, async (_, newSettings) => {
  settings.save(newSettings);
  return newSettings;
});
