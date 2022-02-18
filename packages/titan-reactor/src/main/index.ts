import { app, powerSaveBlocker, globalShortcut, dialog } from "electron";
import path from "path";

import "./register-ipc-handlers";
import createAppMenu from "./create-app-menu";

import windows, { createMain } from "./windows";
import settings from "./settings/singleton";
import getUserDataPath from "./get-user-data-path";
import "./plugins/server";
import { strict as assert } from "assert";

const settingsPath = path.join(getUserDataPath(), "settings.yml");

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  const psbId = powerSaveBlocker.start("prevent-display-sleep");

  app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");
  app.commandLine.appendSwitch("--force_high_performance_gpu");
  app.commandLine.appendSwitch("--disable-xr-sandbox");

  createAppMenu(settingsPath);

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('titan-reactor', process.execPath, process.argv.slice(1));
    }
  } else {
    app.setAsDefaultProtocolClient('titan-reactor')
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (windows.main) {
      if (windows.main.isMinimized()) windows.main.restore()
      windows.main.focus()
    }
  });

  app.on('open-url', (event, url) => {
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
  })

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

  app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {
      console.log("CommandOrControl+R is pressed: Shortcut Disabled");
    });
    globalShortcut.register("F5", () => {
      console.log("F5 is pressed: Shortcut Disabled");
    });
  });
}