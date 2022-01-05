import React from "react";
import { render } from "react-dom";

import { openBw } from "./openbw";

import version from "../common/version";
import * as log from "./ipc/log";
// import App from "./react-ui/app";
import {
  loadSettings,
  useSettingsStore,
  errorScreen,
  completeScreen,
  getSettings,
} from "./stores";
import loadFonts from "./bootup/load-fonts";
import registerFileDialogHandlers from "./bootup/register-file-dialog-handlers";
import preloadAssets from "./bootup/load-assets-when-ready";
import "./bootup/three-overrides";
import { waitUnless } from "../common/utils/wait";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

log.info(`titan-reactor ${version}`);
log.info(`chrome ${process.versions.chrome}`);
log.info(`electron ${process.versions.electron}`);

bootup();
async function bootup() {
  try {
    await loadFonts();
    await loadSettings();
    log.info("bootup complete");
    registerFileDialogHandlers();

    const settings = getSettings();
    const hasErrors = useSettingsStore.getState().errors.length > 0;

    if (hasErrors) {
    log.error(`settings errors: ${useSettingsStore.getState().errors.join(", ")}`);
    }


    useSettingsStore.subscribe((state) => {
      if (state.errors) {
        log.error(`settings errors: ${state.errors.join(", ")}`);
      }
    });

    await openBw.loaded;
    await waitUnless(10_000, preloadAssets(settings, hasErrors));
    completeScreen();
  } catch (err: any) {
    log.error(err.message);
    errorScreen(err);
  }
}

// render(<App />, document.getElementById("app"));
