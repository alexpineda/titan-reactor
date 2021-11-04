import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import { format as formatUrl } from "url";

const browserWindows = {} as {
  main: null | BrowserWindow;
};

export const initializeGameWindow = () => {
  const w = new BrowserWindow({
    width: 900,
    height: 680,
    backgroundColor: "#242526",
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: true,
      spellcheck: false,
      enableWebSQL: false,
      contextIsolation: false,
      defaultFontSize: 14,
      backgroundThrottling: false,
    },
  });
  w.maximize();
  w.autoHideMenuBar = false;
  // gameWindow.removeMenu();

  if (isDev) {
    w.webContents.openDevTools();
  }

  if (isDev) {
    w.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    w.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    );
  }

  w.on("closed", () => {
    browserWindows.main = null;
  });
  w.webContents.on("devtools-opened", () => {
    w.focus();
    setImmediate(() => {
      w.focus();
    });
  });
  w.on("unresponsive", () => console.error("unresponsive"));
  w.on("ready-to-show", () => {
    w.show();
  });

  browserWindows.main = w;
};

export default browserWindows;
