import { Settings } from "common/types";

const migrations: ((settings: any) => [boolean, any])[] = [];

export default (_settings: any): [boolean, Settings] => {
    let settings = _settings;
    let anyMigrated = false;
    for (const migration of migrations) {
        const [migrated, migratedSettings] = migration(settings);
        if (migrated) {
            settings = migratedSettings;
            anyMigrated = true;
        }
    }
    return [anyMigrated, settings as Settings];
}