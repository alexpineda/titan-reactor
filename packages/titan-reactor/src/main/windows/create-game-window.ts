import isDev from "electron-is-dev";
import path from "path";
import { format as formatUrl } from "url";
import { BrowserWindow } from "electron";

interface CreateWindowArgs {
  onClose: () => void;
}

export const createWindow = ({ onClose }: CreateWindowArgs) => {
  const w = new BrowserWindow({
    width: 900,
    height: 680,
    backgroundColor: "#242526",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webSecurity: true,
      spellcheck: false,
      enableWebSQL: false,
      contextIsolation: false,
      defaultFontSize: 14,
      backgroundThrottling: true,
    },
  });

  w.removeMenu();

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

  w.on("ready-to-show", () => {
    w.show();
  });

  w.on("closed", onClose);

  return w;
}

export default ({ onClose }: CreateWindowArgs) => {
  const w = new BrowserWindow({
    width: 900,
    height: 680,
    backgroundColor: "#242526",
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webSecurity: true,
      spellcheck: false,
      enableWebSQL: false,
      contextIsolation: false,
      defaultFontSize: 14,
      backgroundThrottling: false,
    },
  });
  w.maximize();
  w.autoHideMenuBar = true;
  // w.removeMenu();

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

  w.on("closed", onClose);
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

  return w;
};
