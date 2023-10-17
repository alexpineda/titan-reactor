import { ipcRenderer } from "electron";

import { GET_USER_SETTINGS_REMOTE, SAVE_USER_SETTINGS_REMOTE } from "common/ipc-handle-names";
import { Settings, SettingsMeta } from "common/types";

export const getSettings: () => Promise<SettingsMeta> = async () => {
    return ( await ipcRenderer.invoke( GET_USER_SETTINGS_REMOTE ) ) as SettingsMeta;
};

export const saveSettings = async ( settings: Settings ) => {
    return ( await ipcRenderer.invoke( SAVE_USER_SETTINGS_REMOTE, settings ) ) as Settings;
};
