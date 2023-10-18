// import { Settings } from "common/types";
// import { ipcMain } from "electron";

// import { GET_USER_SETTINGS_REMOTE, SAVE_USER_SETTINGS_REMOTE } from "../../common/ipc-handle-names";
// import settings from "../settings/singleton";

// ipcMain.handle( GET_USER_SETTINGS_REMOTE, async () => {
//     return await settings.getMeta();
// } );

// ipcMain.handle( SAVE_USER_SETTINGS_REMOTE, async ( _, newSettings: Partial<Settings> ) => {
//     await settings.save( newSettings );
//     return newSettings;
// } );
