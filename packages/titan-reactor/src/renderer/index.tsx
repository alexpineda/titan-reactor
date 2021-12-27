import React from "react";
import { render } from "react-dom";

import version from "../common/version";
import { log } from "./ipc";
// import App from "./react-ui/app";
import {
  loadSettings,
  useSettingsStore,
  errorUIType,
  completeUIType,
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

log(`titan-reactor ${version}`);
log(`chrome ${process.versions.chrome}`);
log(`electron ${process.versions.electron}`);

bootup();
async function bootup() {
  try {
    await loadFonts();
    await loadSettings();
    log("bootup complete");
    registerFileDialogHandlers();

    const settings = useSettingsStore.getState().data;
    const hasErrors = useSettingsStore.getState().errors.length > 0;

    await waitUnless(10_000, preloadAssets(settings, hasErrors));
    completeUIType();
  } catch (err: any) {
    log(err.message, "error");
    errorUIType(err);
  }
}

// render(<App />, document.getElementById("app"));
