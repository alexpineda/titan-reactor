import { Settings } from "../../../common/types";
import v2ToV3 from "./v2-to-v3";

const migrations: ((settings: any) => [boolean, any])[] = [v2ToV3];

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