import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import { pathToFileURL } from "url";

const browserWindows = {} as {
  main: null | BrowserWindow;
  config: null | BrowserWindow;
  iscriptah: null | BrowserWindow;
};

interface CreateWindowArgs {
  onClose?: () => void;
  removeMenu?: boolean;
  hideMenu?: boolean;
  devTools?: boolean;
  backgroundColor?: string;
  nodeIntegration?: boolean;
  backgroundThrottling?: boolean;
  debugMode?: boolean;
}

const createDefaultArgs = (args: CreateWindowArgs) => Object.assign({}, { onClose: () => { }, query: "", removeMenu: false, hideMenu: false, backgroundColor: "#242526", nodeIntegration: false, devTools: false, backgroundThrottling: true }, args);

export const createWindow = (createWindowArgs: CreateWindowArgs) => {
  const { onClose, removeMenu, hideMenu, devTools, backgroundColor, nodeIntegration, backgroundThrottling, debugMode } = createDefaultArgs(createWindowArgs);

  const w = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor,
    show: false,
    webPreferences: {
      nodeIntegration,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webSecurity: true,
      spellcheck: false,
      enableWebSQL: false,
      contextIsolation: false,
      defaultFontSize: 14,
      backgroundThrottling,
    },
  });

  w.setAutoHideMenuBar(hideMenu)

  if (removeMenu) {
    w.removeMenu();
  }

  if (isDev) {
    w.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    w.loadURL(pathToFileURL(path.join(__dirname, 'index.html')).toString());
  }

  // on(event: 'unresponsive', listener: Function): this;

  w.on("ready-to-show", () => {
    w.show();
    if ((isDev || debugMode) && devTools) {
      w.webContents.openDevTools();
    }
  });


  w.on("closed", onClose);

  w.webContents.on("devtools-opened", () => {
    w.focus();
    setImmediate(() => {
      w.focus();
    });
  });

  return w;
}
export default browserWindows;
