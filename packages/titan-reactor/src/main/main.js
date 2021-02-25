import {
  app,
  ipcMain,
  Menu,
  BrowserWindow,
  shell,
  dialog,
  protocol,
  ipcRenderer,
} from "electron";
import isDev from "electron-is-dev";
import installExtension, { REDUX_DEVTOOLS } from "electron-devtools-installer";
import { openFileBinary } from "titan-reactor-shared/utils/fs";
import path from "path";
import Parser from "rss-parser";
import createScmExtractor from "scm-extractor";
import concat from "concat-stream";
import { Readable } from "stream";

import {
  GET_APPCACHE_PATH,
  OPEN_FILE,
  OPEN_DATA_FILE,
  LOAD_ALL_DATA_FILES,
  SELECT_FOLDER,
  GET_SETTINGS,
  SET_SETTINGS,
  SETTINGS_CHANGED,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  LOG_MESSAGE,
  EXIT,
  SET_WEBGL_CAPABILITIES,
  GET_RSS_FEED,
  LOAD_REPLAY_FROM_FILE,
  REQUEST_NEXT_FRAMES,
  STOP_READING_GAME_STATE,
  LOAD_CHK,
  LOAD_SCX,
} from "../common/handleNames";
import { loadAllDataFiles } from "titan-reactor-shared/dat/loadAllDataFiles";
import { Settings } from "./settings";
import { getUserDataPath } from "./userDataPath";
import logger from "./logger";
import Chk from "../../libs/bw-chk";
import BufferList from "bl";
import ReplayReadFile from "../renderer/replay/bw/ReplayReadFile";

const gotTheLock = app.requestSingleInstanceLock();

let gameWindow;
let gameStateReader;
let settings;

function createWindow() {
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
      // contextIsolation: true,
      // worldSafeExecuteJavaScript: true,
      // enableRemoteModule: false
    },
  });
  gameWindow.maximize();
  gameWindow.autoHideMenuBar = true;

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

if (gotTheLock) {
  // app.commandLine.appendSwitch("disable-frame-rate-limit");
  // app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");
  app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

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
      gameWindow.webContents.send(SETTINGS_CHANGED, settings);
      if (settings.diff.fullscreen !== undefined) {
        updateFullScreen(settings.diff.fullscreen);
      }
    });

    ipcMain.handle(GET_SETTINGS, async () => {
      return await settings.get();
    });

    ipcMain.handle(SET_SETTINGS, async (event, newSettings) => {
      settings.save(newSettings);
      return newSettings;
    });

    ipcMain.handle(SET_WEBGL_CAPABILITIES, async (event, webGLCapabilities) => {
      await settings.init(webGLCapabilities);
      const s = await settings.get();
      updateFullScreen(s.data.fullscreen);
    });

    ipcMain.handle(
      LOAD_REPLAY_FROM_FILE,
      async (event, repFile, outFile, starcraftPath) => {
        gameStateReader = new ReplayReadFile(repFile, outFile, starcraftPath);
        await gameStateReader.start();
        await gameStateReader.waitForMaxed;
      }
    );

    ipcMain.handle(REQUEST_NEXT_FRAMES, async (event, frames) => {
      return gameStateReader.next(frames);
    });

    ipcMain.handle(STOP_READING_GAME_STATE, async (event) => {
      gameStateReader.dispose();
      gameStateReader = null;
    });

    installExtension(REDUX_DEVTOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log("An error occurred: ", err));

    createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  ipcMain.on(EXIT, () => app.exit(0));

  app.on("activate", () => {
    if (gameWindow === null) {
      createWindow();
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

  ipcMain.handle(OPEN_DATA_FILE, async (event, filepath) => {
    const dataPath = isDev
      ? path.join(`./data/${filepath}`)
      : path.join(process.resourcesPath, "data", filepath);

    return await openFileBinary(dataPath);
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

  ipcMain.handle(GET_RSS_FEED, async (event, url) => {
    const parser = new Parser();
    return await parser.parseURL(url);
  });

  ipcMain.handle(LOAD_CHK, (event, buf) => {
    const chk = new Chk(new BufferList(buf));
    return chk;
  });

  ipcMain.handle(LOAD_SCX, async (event, buf) => {
    const readable = new Readable({ read: () => {} });
    readable.push(Buffer.from(buf));
    readable.push(null);

    const chk = await new Promise((res) =>
      readable.pipe(createScmExtractor()).pipe(
        concat((data) => {
          res(data);
        })
      )
    );
    const res = new Chk(chk);
    return res;
  });
} else {
  app.quit();
}
