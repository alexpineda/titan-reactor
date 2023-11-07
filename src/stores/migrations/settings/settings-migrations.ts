import { Settings, SettingsV5 } from "common/types";
import { v5tov6 } from "./v5-v6";

export type PreviousSettings = SettingsV5 | Settings;

const migrations: ( ( settings: PreviousSettings ) => PreviousSettings )[] = [ v5tov6 ];

export const applySettingsMigrations = ( _settings: PreviousSettings ): Settings => {
    let settings = _settings;

    for ( const migration of migrations ) {
        settings = migration( settings );
    }

    if ( settings.version !== 6 ) {
        throw new Error(
            `Settings migration failed. Expected version 6, got ${settings.version}`
        );
    }

    return settings;
};
