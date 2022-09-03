import { defaultSettingsV5 } from "common/default-settings";
import { SettingsV5 } from "common/types";
import { PreviousSettings } from ".";

export const v4Tov5 = (oldSettings: PreviousSettings): PreviousSettings => {
    if (oldSettings.version != 4) {
        return oldSettings;
    }
    const settings: SettingsV5 = {
        version: 5,
        language: oldSettings.language,
        directories: oldSettings.directories,
        assets: defaultSettingsV5.assets,
        audio: {
            ...defaultSettingsV5.audio,
            ...oldSettings.audio
        },
        game: defaultSettingsV5.game,
        graphics: defaultSettingsV5.graphics,
        util: oldSettings.util,
        plugins: oldSettings.plugins,
        macros: defaultSettingsV5.macros,
    };

    return settings;
}