import { app, powerSaveBlocker, protocol, BrowserView } from "electron";
import path from "path";

import "./register-ipc-handlers";
import createAppMenu from "./create-app-menu";

import windows, { createMain } from "./windows";
import settings from "./settings/singleton";
import getUserDataPath from "./get-user-data-path";
import electronIsDev from "electron-is-dev";
import { strict as assert } from "assert";

const settingsPath = path.join(getUserDataPath(), "settings.yml");
const psbId = powerSaveBlocker.start("prevent-display-sleep");

app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  powerSaveBlocker.stop(psbId);
  app.quit();
}

// custom gc size
// app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");
app.commandLine.appendSwitch("--force_high_performance_gpu");

// const bv = new BrowserView({
//   webPreferences: {
//     nodeIntegration: false,
//     contextIsolation: true,
//     preload: path.join(__dirname, "preload.js"),
//     devTools: electronIsDev,
//     disableDialogs: true,
//     spellcheck: false,
//     enableWebSQL: false,
//   },
// });

app.commandLine.appendSwitch("--disable-xr-sandbox");

createAppMenu(settingsPath);

app.on("ready", async () => {
  await settings.init(settingsPath);
  if (!windows.main) {
    createMain();
  }
  const updateFullScreen = (fullscreen: boolean) => {
    assert(windows.main)
    windows.main.setFullScreen(fullscreen);
    windows.main.autoHideMenuBar = fullscreen;
    if (fullscreen) {
      windows.main?.maximize();
    }
  };

  settings.on("change", (settings) => {
    if (settings.diff?.graphics?.fullscreen !== undefined) {
      updateFullScreen(settings.diff.graphics.fullscreen);
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
