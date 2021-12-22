import React from "react";
import { render } from "react-dom";

import version from "../common/version";
import { log } from "./ipc";
import App from "./react-ui/app";
import { loadSettings, errorUIType, completeUIType } from "./stores";
import loadFonts from "./bootup/load-fonts";
import registerFileDialogHandlers from "./bootup/register-file-dialog-handlers";
import preloadAssets from "./bootup/preload-assets";
import "./bootup/three-overrides";

if (module.hot) {
  module.hot.accept();
}

log(`titan-reactor ${version}`);
log(`chrome ${process.versions.chrome}`);
log(`electron ${process.versions.electron}`);

let _errored = false;

preloadAssets();
bootup();

setTimeout(() => {
  !_errored && completeUIType();
}, 10000);

async function bootup() {
  try {
    await loadFonts();
    await loadSettings();
    log("bootup complete");
    registerFileDialogHandlers();
  } catch (err: any) {
    log(err.message, "error");
    errorUIType(err);
    _errored = true;
  }
}

render(<App />, document.getElementById("app"));