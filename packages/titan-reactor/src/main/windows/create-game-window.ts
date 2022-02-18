import isDev from "electron-is-dev";
import path from "path";
import { format as formatUrl } from "url";
import { BrowserWindow } from "electron";

interface CreateGameWindowArgs {
  onClose: () => void;
}
export default ({ onClose }: CreateGameWindowArgs) => {
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
