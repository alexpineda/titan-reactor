import { defaultSettingsV6 } from "common/default-settings";
import { Settings } from "common/types";
import { PreviousSettings } from ".";

export const v5tov6 = (oldSettings: PreviousSettings): PreviousSettings => {
    if (oldSettings.version != 5) {
        return oldSettings;
    }
    const settings: Settings = {
        ...oldSettings,
        version: 6,
        game: defaultSettingsV6.game,
        postprocessing: defaultSettingsV6.postprocessing,
        postprocessing3d: defaultSettingsV6.postprocessing3d,
        graphics: defaultSettingsV6.graphics,
    };

    return settings;
}