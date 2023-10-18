// import { ipcRenderer } from "electron";

// import { GET_USER_SETTINGS_REMOTE, SAVE_USER_SETTINGS_REMOTE } from "common/ipc-handle-names";
import { Settings, SettingsMeta } from "common/types";

export const getSettings: () => Promise<SettingsMeta> = async () => {
    return {} as SettingsMeta;
};

export const saveSettings = async ( settings: Settings ) => {
    console.log( "saving settings", settings );
};
