
import {
  setAssets,
  useSettingsStore,
  isProcessInProgress,
  isProcessComplete
} from "../stores";
import loadAssets from "../assets/load-assets";

export default () =>
  // preload assets once valid settings are available
  useSettingsStore.subscribe(
    async ({ errors, data: settings }) => {
      if (errors.length || !settings || !settings.starcraftPath || !settings.communityModelsPath) {
        return;
      }


      // @todo allow dynamic loading of assets
      if (isProcessComplete("assets") || isProcessInProgress("assets")) {
        return;
      }
      const assets = await loadAssets(settings.starcraftPath, settings.communityModelsPath);
      setAssets(assets);
    }
  );