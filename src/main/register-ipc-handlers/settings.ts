import { ipcMain } from "electron";
import browserWindows from "../windows";

import { GET_LOADED_SETTINGS, SETTINGS_WERE_SAVED, SAVE_SETTINGS_DATA } from "../../common/ipc-handle-names";
import settings from "../settings/singleton";

ipcMain.handle(GET_LOADED_SETTINGS, async () => {
  return await settings.getMeta();
});

ipcMain.handle(SAVE_SETTINGS_DATA, async (_, newSettings) => {
  settings.save(newSettings);
  browserWindows.main?.webContents.send(SETTINGS_WERE_SAVED, await settings.getMeta());
  return newSettings;
});
