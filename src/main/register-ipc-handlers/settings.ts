import { Settings } from "common/types";
import { ipcMain } from "electron";

import { GET_LOADED_SETTINGS, SAVE_SETTINGS_DATA } from "../../common/ipc-handle-names";
import settings from "../settings/singleton";

ipcMain.handle( GET_LOADED_SETTINGS, async () => {
    return await settings.getMeta();
} );

ipcMain.handle( SAVE_SETTINGS_DATA, async ( _, newSettings: Partial<Settings> ) => {
    await settings.save( newSettings );
    return newSettings;
} );
