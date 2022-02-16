import { SettingsV2 } from "../../../common/types/settings/settings.old.v2";
import { Settings } from "../../../common/types/settings";
import { defaultSettings } from "../../../common/settings";

export default (oldSettings: SettingsV2): [boolean, any] => {
    if (oldSettings.version !== 2) {
        return [false, oldSettings];
    }
    const newSettings = Object.assign({}, oldSettings, {
        version: 3 as const,
        controls: {
            ...oldSettings.controls,
            camera: {
                ...oldSettings.controls.camera,
                helicopterRotateSpeed: defaultSettings.controls.camera.helicopterRotateSpeed,
            }
        }
    });
    return [true, newSettings];
}