import { app, powerSaveBlocker, protocol } from "electron";
import path from "path";

import "./register-ipc-handlers";
import "./create-app-menu";

import windows, { createMain } from "./windows";
import settings from "./settings/singleton";
import getUserDataPath from "./get-user-data-path";

const psbId = powerSaveBlocker.start("prevent-display-sleep");

app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  powerSaveBlocker.stop(psbId);
  app.quit();
}

// custom gc size
// app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "file",
    privileges: { standard: true, bypassCSP: true, corsEnabled: false },
  },
]);

app.commandLine.appendSwitch("--disable-xr-sandbox");

app.on("ready", async () => {
  await settings.init(path.join(getUserDataPath(), "settings.json"));
  if (!windows.main) {
    createMain();
  }
  const updateFullScreen = (fullscreen: boolean) => {
    windows.main?.setFullScreen(fullscreen);
    if (fullscreen) {
      windows.main?.maximize();
    }
  };

  settings.on("change", (settings) => {
    if (settings.diff.fullscreen !== undefined) {
      updateFullScreen(settings.diff.fullscreen);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    powerSaveBlocker.stop(psbId);
    app.quit();
  }
});

app.on("activate", () => {
  if (!windows.main) {
    createMain();
  }
});

app.on("web-contents-created", (_, contents) => {
  // prevent navigation
  contents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  // prevent new windows
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
});
