
import {
  useSettingsStore,
} from "../stores";
import processStore, { Process } from "../stores/process-store";
import loadAndParseAssets from "./load-and-parse-assets";
import { Settings } from "../../common/types";

const tryLoad = async (settings: Settings, hasErrors: boolean, onSuccess: () => void) => {
  if (hasErrors || !settings || !settings.directories?.starcraft || !settings.directories?.assets) {
    return;
  }
  if (processStore().isComplete(Process.AtlasPreload) || processStore().isInProgress(Process.AtlasPreload)) {
    return;
  }
  await loadAndParseAssets(settings);
  onSuccess();
  return true;
};

const tryAndRetry = async (initialSettings: Settings, hasErrors: boolean, res: (value: unknown) => void) => {
  if (await tryLoad(initialSettings, hasErrors, () => {
    res(null);
  })) {
    return;
  }
  const unsub = useSettingsStore.subscribe(
    async ({ errors, data: settings }) => {

      tryLoad(settings, errors.length > 0, () => {
        unsub();
        res(null);
      });

    }
  );
};

// preload assets once valid settings are available
// return a promise for convenience to the caller
export default (initialSettings: Settings, hasErrors: boolean) => new Promise(res => {
  tryAndRetry(initialSettings, hasErrors, res);
});