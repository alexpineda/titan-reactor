import { app, Menu, BrowserWindow, shell, dialog } from "electron";

import path from "path";
import isDev from "electron-is-dev";
import "./handlers";

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

app.on("ready", () => {
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

var showOpen = function (isMap = false) {
  const filters = isMap
    ? [{ name: "Starcraft Map", extensions: ["scm", "scx"] }]
    : [{ name: "Starcraft Replay", extensions: ["rep.bin"] }];
  const command = isMap ? "open-map" : "open-replay";
  const multiSelections = isMap
    ? ["openFile"]
    : ["openFile", "multiSelections"];
  dialog
    .showOpenDialog({
      properties: multiSelections,
      filters,
    })
    .then(({ filePaths, canceled }) => {
      if (canceled) return;
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

// const showOpenReplay = () => {
//   dialog
//     .showOpenDialog({
//       properties: ["openFile", "multiSelections"],
//       filters: { name: "Starcraft Replay", extensions: ["rep"] },
//     })
//     .then(({ filePaths, canceled }) => {
//       if (canceled) return;
//       window.webContents.send("open-replay", filePaths);
//     })
//     .catch((err) => {
//       dialog.showMessageBox({
//         type: "error",
//         title: "Error Loading File",
//         message: "There was an error loading this file: " + err.message,
//       });
//     });
// };
const showOpenReplay = showOpen.bind(null, false);

const showOpenMap = showOpen.bind(null, true);

const showSave = (isImage) => {
  const filters = isImage
    ? [{ name: "Image (.jpeg)", extensions: ["png"] }]
    : [{ name: "Scene (.gltf)", extensions: ["gltf"] }];
  const command = isImage ? "save-image" : "save-gltf";

  dialog
    .showSaveDialog({
      filters,
    })
    .then(({ filePath, canceled }) => {
      if (canceled) return;
      window.webContents.send(command, filePath);
    })
    .catch((err) => {
      dialog.showMessageBox({
        type: "error",
        title: "Error Saving File",
        message: "There was an error loading this file: " + err.message,
      });
    });
};

const showSaveModel = showSave.bind(null, false);
const showSaveImage = () => {
  window.webContents.send("save-image");
};

var showOpenEnvironmentSettings = function () {
  const filters = [{ name: "Environment Settings", extensions: ["json"] }];
  const command = "open-env-settings";
  const multiSelections = ["openFile"];

  dialog
    .showOpenDialog({
      properties: multiSelections,
      filters,
    })
    .then(({ filePaths, canceled }) => {
      if (canceled) return;
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

const showSaveEnvironmentSettings = (isImage) => {
  const filters = { name: "Environment Settings", extensions: ["json"] };
  const command = "save-env-settings";

  dialog
    .showSaveDialog({
      filters,
    })
    .then(({ filePath, canceled }) => {
      if (canceled) return;
      window.webContents.send(command, filePath);
    })
    .catch((err) => {
      dialog.showMessageBox({
        type: "error",
        title: "Error Saving File",
        message: "There was an error loading this file: " + err.message,
      });
    });
};

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
    submenu: submenu
      .concat([
        { type: "separator" },
        {
          label: "Export Scene",
          click: function () {
            showSaveModel();
          },
        },
        {
          label: "Export Image",
          click: function () {
            showSaveImage();
          },
        },
        { type: "separator" },
        { role: isMac ? "close" : "quit" },
      ])
      .concat(
        isDev
          ? [
              { type: "separator" },
              {
                label: "Load Environment Settings",
                click: function () {
                  showOpenEnvironmentSettings();
                },
              },
              {
                label: "Save Environment Settings",
                click: function () {
                  showSaveEnvironmentSettings();
                },
              },
            ]
          : []
      ),
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
