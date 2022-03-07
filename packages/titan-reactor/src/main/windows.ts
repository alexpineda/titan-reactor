import { BrowserView, BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import { format as formatUrl } from "url";


const browserWindows = {} as {
  main: null | BrowserWindow;
  config: null | BrowserWindow;
};

interface CreateWindowArgs {
  onClose?: () => void;
  query?: string;
  removeMenu?: boolean;
  hideMenu?: boolean;
  devTools?: boolean;
  backgroundColor?: string;
  nodeIntegration?: boolean;
  backgroundThrottling?: boolean;
}

const createDefaultArgs = (args: CreateWindowArgs) => Object.assign({}, { onClose: () => { }, query: "", removeMenu: false, hideMenu: false, backgroundColor: "#242526", nodeIntegration: false, devTools: false, backgroundThrottling: true }, args);

export const createWindow = (createWindowArgs: CreateWindowArgs) => {
  const { onClose, query, removeMenu, hideMenu, devTools, backgroundColor, nodeIntegration, backgroundThrottling } = createDefaultArgs(createWindowArgs);

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
    w.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}${query}`);
  } else {
    w.loadURL(
      formatUrl({
        pathname: path.join(__dirname, `index.html${query}`),
        protocol: "file",
        slashes: true,
      })
    );
  }

  w.on("ready-to-show", () => {
    w.show();
  });

  w.on("closed", onClose);

  if (isDev && devTools) {
    w.webContents.openDevTools();
  }

  w.webContents.on("devtools-opened", () => {
    w.focus();
    setImmediate(() => {
      w.focus();
    });
  });

  return w;
}


export const createBrowserView = (createWindowArgs: CreateWindowArgs) => {
  const { query, backgroundColor, nodeIntegration } = createDefaultArgs(createWindowArgs);

  const view = new BrowserView({
    webPreferences: {
      nodeIntegration,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webSecurity: true,
      spellcheck: false,
      enableWebSQL: false,
      contextIsolation: false,
      defaultFontSize: 14,
      backgroundThrottling: true,
    }
  });
  view.setBackgroundColor(backgroundColor);
  view.setBounds({ x: 0, y: 0, width: 600, height: 400 });
  // view.setAutoResize({ width: true, height: true });

  if (isDev) {
    view.webContents.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}${query}`);
  } else {
    view.webContents.loadURL(
      formatUrl({
        pathname: path.join(__dirname, `index.html${query}`),
        protocol: "file",
        slashes: true,
      })
    );
  }

  return view;
}
export default browserWindows;
