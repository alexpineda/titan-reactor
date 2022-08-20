import { Settings, SettingsV4, SettingsV5 } from "common/types";
import { v4Tov5 } from "./v4-v5";

export type PreviousSettings = SettingsV4 | SettingsV5;

const migrations: ((settings: PreviousSettings) => PreviousSettings)[] = [v4Tov5];

export const doMigrations = (_settings: PreviousSettings): Settings => {
    let settings = _settings;

    for (const migration of migrations) {
        settings = migration(settings);
    }
    if (settings.version !== 5) {
        throw new Error(`Settings version ${settings.version} is not supported`);
    }
    return settings as Settings;
}