import { app, ipcMain, Menu, BrowserWindow, shell, dialog } from "electron";
import isDev from "electron-is-dev";
import { openFileBinary } from "./fs";
import path from "path";
import {
  GET_APPCACHE_PATH,
  OPEN_FILE,
  LOAD_ALL_DATA_FILES,
  SELECT_FOLDER,
  GET_SETTINGS,
  SET_SETTINGS,
  SETTINGS_CHANGED,
  GET_LANGUAGE,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  LOG_MESSAGE,
  EXIT,
} from "../common/handleNames";
import { loadAllDataFiles } from "./units/loadAllDataFiles";
import { Settings } from "./settings";
import { getUserDataPath } from "./userDataPath";
import lang from "../common/lang";
import logger from "./logger";

let window;

function createWindow() {
  window = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      // contextIsolation: true,
      // worldSafeExecuteJavaScript: true,
      // enableRemoteModule: false
    },
  });
  window.maximize();
  // window.setFullScreen(true);

  if (isDev) {
    window.webContents.openDevTools();
  }

  if (isDev) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    );
  }

  window.webContents.openDevTools();
  window.on("closed", () => (window = null));
  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });
}

app.commandLine.appendSwitch("--disable-xr-sandbox");

app.on("ready", async () => {
  const settings = new Settings(path.join(getUserDataPath(), "settings.json"));
  await settings.init();

  settings.on("change", (settings) => {
    console.log("change", settings);
    window.webContents.send(SETTINGS_CHANGED, settings);
  });

  ipcMain.handle(GET_SETTINGS, async (event) => {
    return await settings.get();
  });

  ipcMain.handle(SET_SETTINGS, async (event, newSettings) => {
    settings.save(newSettings);
  });

  ipcMain.handle(GET_LANGUAGE, async (event) => {
    return lang[settings.get().language];
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (window === null) {
    createWindow();
  }
});

app.on("web-contents-created", (event, contents) => {
  // prevent navigation
  contents.on("will-navigate", (event, navigationUrl) => {
    event.preventDefault();
  });

  // prevent new windows
  contents.on("new-window", async (event, navigationUrl) => {
    event.preventDefault();
  });
});

const isMac = process.platform === "darwin";

var showOpen = function (isMap = false, defaultPath = "") {
  const filters = isMap
    ? [{ name: "Starcraft Map", extensions: ["scm", "scx"] }]
    : [{ name: "Starcraft Replay", extensions: ["rep"] }];
  const command = isMap ? OPEN_MAP_DIALOG : OPEN_REPLAY_DIALOG;
  const multiSelections = isMap
    ? ["openFile"]
    : ["openFile", "multiSelections"];
  dialog
    .showOpenDialog({
      properties: multiSelections,
      filters,
      defaultPath,
    })
    .then(({ filePaths, canceled }) => {
      if (canceled) return;
      logger.log();

      window.webContents.send(command, filePaths);
    })
    .catch((err) => {
      dialog.showMessageBox({
        type: "error",
        title: "Error Loading File",
        message: "There was an error loading this file: " + err.message,
      });
    });
};

const showOpenReplay = showOpen.bind(null, false);

const showOpenMap = showOpen.bind(null, true);

const submenu = [
  {
    label: "Open &Map",
    click: function () {
      showOpenMap();
    },
  },
];

if (true) {
  submenu.push({
    label: "&Open Replay",
    accelerator: "CmdOrCtrl+Shift+O",
    click: function () {
      showOpenReplay();
    },
  });
}

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: "&File",
    submenu: submenu.concat([
      { type: "separator" },
      { role: isMac ? "close" : "quit" },
    ]),
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:",
      },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forcereload" },
      { role: "toggledevtools" },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...(isMac
        ? [
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" },
          ]
        : [{ role: "close" }]),
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

ipcMain.handle(GET_APPCACHE_PATH, async (event, folder = "") => {
  return path.join(app.getPath("temp"), folder);
});

ipcMain.handle(OPEN_FILE, async (event, filepath = "") => {
  return await openFileBinary(filepath);
});

ipcMain.handle(LOAD_ALL_DATA_FILES, async (event, bwDataPath) => {
  return await loadAllDataFiles(bwDataPath);
});

ipcMain.on(OPEN_MAP_DIALOG, async (event, defaultPath = "") => {
  showOpenMap(defaultPath);
});

ipcMain.on(OPEN_REPLAY_DIALOG, async (event, defaultPath = "") => {
  showOpenReplay(defaultPath);
});

ipcMain.on(LOG_MESSAGE, (event, { level, message }) => {
  logger.log(level, message);
});

ipcMain.on(EXIT, () => {
  app.exit(0);
});

ipcMain.on(SELECT_FOLDER, async (event, key) => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
    })
    .then(({ filePaths, canceled }) => {
      console.log("show open dialog", filePaths);
      if (canceled) return;
      event.sender.send(SELECT_FOLDER, { key, filePaths });
    })
    .catch((err) => {
      dialog.showMessageBox({
        type: "error",
        title: "Error Loading File",
        message: "There was an error selecting path: " + err.message,
      });
    });
});
