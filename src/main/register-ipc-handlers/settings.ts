import { ipcMain } from "electron";

import { GET_LOADED_SETTINGS, SAVE_SETTINGS_DATA } from "../../common/ipc-handle-names";
import settings from "../settings/singleton";

ipcMain.handle(GET_LOADED_SETTINGS, async () => {
  return await settings.getMeta();
});

ipcMain.handle(SAVE_SETTINGS_DATA, async (_, newSettings) => {
  settings.save(newSettings);
  return newSettings;
});
