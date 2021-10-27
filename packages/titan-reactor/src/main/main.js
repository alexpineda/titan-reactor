import {
  app,
  ipcMain,
  Menu,
  BrowserWindow,
  shell,
  dialog,
  protocol,
  powerSaveBlocker,
} from "electron";
import isDev from "electron-is-dev";
import { format as formatUrl } from "url";
import { openFileBinary } from "../common/utils/fs";
import path from "path";

powerSaveBlocker.start("prevent-display-sleep");

import {
  OPEN_FILE,
  SELECT_FOLDER,
  GET_SETTINGS,
  SET_SETTINGS,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  OPEN_DEMO_REPLAY,
  LOG_MESSAGE,
  EXIT,
  LOAD_REPLAY_FROM_FILE,
  REQUEST_NEXT_FRAMES,
  STOP_READING_GAME_STATE,
} from "../common/ipc/handleNames";
import { Settings } from "./settings";
import { getUserDataPath } from "./userDataPath";
import logger from "./logger";
import FileGameStateReader from "../renderer/game-data/readers/FileGameStateReader";

// app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
// app.commandLine.appendSwitch("disable-frame-rate-limit");
app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");
const gotTheLock = app.requestSingleInstanceLock();

let gameWindow;
let gameStateReader;
let settings;

function createGameWindow() {
  gameWindow = new BrowserWindow({
    width: 900,
    height: 680,
    backgroundColor: "#242526",
    webPreferences: {
      // preload: "",
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: true,
      spellcheck: false,
      enableWebSQL: false,
      contextIsolation: false,
      // worldSafeExecuteJavaScript: true,
      enableRemoteModule: true,
      defaultFontSize: 14,
    },
  });
  gameWindow.maximize();
  gameWindow.autoHideMenuBar = true;
  // gameWindow.removeMenu();

  if (isDev) {
    gameWindow.webContents.openDevTools();
  }

  if (isDev) {
    gameWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    );
  } else {
    gameWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    );
  }

  gameWindow.on("closed", () => (gameWindow = null));
  gameWindow.webContents.on("devtools-opened", () => {
    gameWindow.focus();
    setImmediate(() => {
      gameWindow.focus();
    });
  });
}

if (!gotTheLock) {
  app.quit();
}

// custom node heap size
// app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "file",
    privileges: { standard: true, bypassCSP: true, corsEnabled: false },
  },
]);

app.commandLine.appendSwitch("--disable-xr-sandbox");

app.on("ready", async () => {
  settings = new Settings(path.join(getUserDataPath(), "settings.json"));

  const updateFullScreen = (fullscreen) => {
    gameWindow.setFullScreen(fullscreen);
    if (fullscreen) {
      gameWindow.maximize();
    }
  };

  settings.on("change", (settings) => {
    if (settings.diff.fullscreen !== undefined) {
      updateFullScreen(settings.diff.fullscreen);
    }
  });

  ipcMain.handle(GET_SETTINGS, async () => {
    await settings.init();

    return await settings.get();
  });

  ipcMain.handle(SET_SETTINGS, async (event, newSettings) => {
    settings.save(newSettings);
    return newSettings;
  });

  ipcMain.handle(
    LOAD_REPLAY_FROM_FILE,
    async (event, repFile, outFile, starcraftPath) => {
      gameStateReader = new FileGameStateReader(
        repFile,
        outFile,
        starcraftPath
      );
      await gameStateReader.start();
      await gameStateReader.waitForMaxed;
    }
  );

  ipcMain.handle(REQUEST_NEXT_FRAMES, async (_, frames) => {
    return gameStateReader.next(frames);
  });

  ipcMain.handle(STOP_READING_GAME_STATE, async () => {
    gameStateReader.dispose();
    gameStateReader = null;
  });

  createGameWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on(EXIT, () => app.exit(0));

app.on("activate", () => {
  if (gameWindow === null) {
    createGameWindow();
  }
});

app.on("web-contents-created", (event, contents) => {
  // prevent navigation
  contents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  // prevent new windows
  contents.on("new-window", async (event) => {
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
      gameWindow.webContents.send(command, filePaths);
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
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "toggledevtools" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
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
          await shell.openExternal("http://imbateam.gg");
        },
      },
      {
        label: "Join Our Discord",
        click: async () => {
          await shell.openExternal("http://discord.imbateam.gg");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

ipcMain.handle(OPEN_FILE, async (_, filepath = "") => {
  return await openFileBinary(filepath);
});

ipcMain.on(OPEN_MAP_DIALOG, async (_, defaultPath = "") => {
  showOpenMap(defaultPath);
});

ipcMain.on(OPEN_REPLAY_DIALOG, async (_, defaultPath = "") => {
  showOpenReplay(defaultPath);
});

ipcMain.on(OPEN_DEMO_REPLAY, async () => {
  gameWindow.webContents.send(OPEN_REPLAY_DIALOG, [`${__static}/demo.rep`]);
});

ipcMain.on(LOG_MESSAGE, (_, { level, message }) => {
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

export const findTempPath = () => app.getPath("temp");
