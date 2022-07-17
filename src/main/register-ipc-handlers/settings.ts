import { ipcMain } from "electron";
import browserWindows from "../windows";

import { GET_LOADED_SETTINGS, SETTINGS_CHANGED, SET_SETTINGS_FROM_CONFIGW } from "../../common/ipc-handle-names";
import settings from "../settings/singleton";

ipcMain.handle(GET_LOADED_SETTINGS, async () => {
  return await settings.getMeta();
});

ipcMain.handle(SET_SETTINGS_FROM_CONFIGW, async (_, newSettings) => {
  settings.save(newSettings);
  browserWindows.main?.webContents.send(SETTINGS_CHANGED, await settings.getMeta());
  return newSettings;
});
