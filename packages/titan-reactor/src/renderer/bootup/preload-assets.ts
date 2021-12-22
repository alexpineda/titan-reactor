
import {
    setAssets,
    useSettingsStore,
} from "../stores";
import Assets from "../assets/assets";

// preload assets once valid settings are available
useSettingsStore.subscribe(
    ({ errors, data: settings }) => {
        if (errors.length || !settings || !settings.starcraftPath || !settings.communityModelsPath) {
            return;
        }

        // @todo allow partial relaod settings.communityModelsPath === prevSettings?.communityModelsPath
        console.log("LOAD START");

        const assets = new Assets();
        setAssets(null);
        assets.preload(settings.starcraftPath, settings.communityModelsPath);
        setAssets(assets);
    }
);