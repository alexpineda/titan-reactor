import { ipcRenderer } from "electron";

import { GET_LOADED_SETTINGS, SAVE_SETTINGS_DATA } from "common/ipc-handle-names";
import { Settings, SettingsMeta } from "common/types";

export const getSettings: () => Promise<SettingsMeta> = async () => {
    return await ipcRenderer.invoke( GET_LOADED_SETTINGS );
};

export const saveSettings: ( settings: Settings ) => Promise<Settings> = async (
    settings: Settings
) => {
    return await ipcRenderer.invoke( SAVE_SETTINGS_DATA, settings );
};
