
import { defaultSettings } from "common/default-settings";
import { Settings, SettingsMeta } from "common/types";

export const getSettings: () => Promise<SettingsMeta> = async () => {
    return {
        activatedPlugins: [],
        settings: defaultSettings,
        data: defaultSettings,
        deactivatedPlugins: [],
        errors: [],
        initialInstall: false,
        isCascStorage: false,
        phrases: {},
    };
};

export const saveSettings = async ( settings: Settings ) => {
//todo: save settings
  console.log(settings)
};
