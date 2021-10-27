import { app, powerSaveBlocker, protocol, Menu, shell } from "electron";
import path from "path";

import "./ipc";
import "./menu";

import browserWindows, { initializeGameWindow } from "./browserWindows";
import { settings } from "./common";
import { getUserDataPath } from "./userDataPath";

const psbId = powerSaveBlocker.start("prevent-display-sleep");

// app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
// app.commandLine.appendSwitch("disable-frame-rate-limit");
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
  console.log("IPC");
  await settings.init(path.join(getUserDataPath(), "settings.json"));
  console.log("starting");
  if (!browserWindows.main) {
    initializeGameWindow();
  }
  console.log("main", browserWindows.main);

  const updateFullScreen = (fullscreen: boolean) => {
    browserWindows.main?.setFullScreen(fullscreen);
    if (fullscreen) {
      browserWindows.main?.maximize();
    }
  };

  settings.on("change", (settings) => {
    if (settings.diff.fullscreen !== undefined) {
      updateFullScreen(settings.diff.fullscreen);
    }
  });
});

app.on("window-all-closed", () => {
  console.log("window-all-closed");
  if (process.platform !== "darwin") {
    powerSaveBlocker.stop(psbId);
    app.quit();
  }
});

app.on("activate", () => {
  console.log("activate", browserWindows.main);
  if (!browserWindows.main) {
    initializeGameWindow();
  }
});

app.on("web-contents-created", (_, contents) => {
  console.log("web - contents - created", contents);
  // prevent navigation
  contents.on("will-navigate", (event) => {
    console.log("will-navigate");
    event.preventDefault();
  });

  contents.on("new-window", (event, url) => {
    event.preventDefault();
  });
  // prevent new windows
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
});
