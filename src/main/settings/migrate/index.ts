import { Settings, SettingsV4, SettingsV5 } from "common/types";
import { v4Tov5 } from "./v4-v5";
import { v5tov6 } from "./v5-v6";

export type PreviousSettings = SettingsV4 | SettingsV5 | Settings;

const migrations: ((settings: PreviousSettings) => PreviousSettings)[] = [v4Tov5, v5tov6];

export const doMigrations = (_settings: PreviousSettings): Settings => {
    let settings = _settings;

    for (const migration of migrations) {
        settings = migration(settings);
    }

    if (settings.version !== 6) {
        throw new Error(`Settings migration failed. Expected version 6, got ${settings.version}`);
    }

    return settings as Settings;
}