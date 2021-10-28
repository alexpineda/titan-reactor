import { ipcMain } from "electron";

import { GET_SETTINGS, SET_SETTINGS } from "../../common/ipc";
import { settings } from "../common";

ipcMain.handle(GET_SETTINGS, async () => {
  return await settings.get();
});

ipcMain.handle(SET_SETTINGS, async (_, newSettings) => {
  settings.save(newSettings);
  return newSettings;
});
