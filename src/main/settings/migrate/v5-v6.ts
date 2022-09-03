import { defaultSettingsV6 } from "common/default-settings";
import { Settings } from "common/types";
import { PreviousSettings } from ".";

export const v5tov6 = (oldSettings: PreviousSettings): PreviousSettings => {
    console.log("Migrating settings from v5 to v6");
    if (oldSettings.version != 5) {
        console.log("exiting early");
        return oldSettings;
    }
    console.log("Creating v6");
    const settings: Settings = {
        ...oldSettings,
        version: 6,
        postprocessing: defaultSettingsV6.postprocessing,
        postprocessing3d: defaultSettingsV6.postprocessing3d,
        graphics: defaultSettingsV6.graphics,
    };

    return settings;
}