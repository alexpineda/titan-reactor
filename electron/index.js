const { app, Menu, BrowserWindow, shell, dialog } = require("electron");

const path = require("path");
const isDev = require("electron-is-dev");
require("./handlers");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
    },
  });
  mainWindow.maximize();
  mainWindow.loadURL(
    isDev
      ? "http://localhost:1234"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const isMac = process.platform === "darwin";

var showOpen = function (isMap = false) {
  const filters = isMap
    ? { name: "Starcraft Map", extensions: ["scm", "scx"] }
    : { name: "Starcraft Replay", extensions: ["rep"] };
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
      mainWindow.webContents.send(command, filePaths);
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

const showSave = (isImage) => {
  const filters = isImage
    ? { name: "Image (.jpeg)", extensions: ["png"] }
    : { name: "Scene (.gltf)", extensions: ["gltf"] };
  const command = isImage ? "save-image" : "save-gltf";

  dialog
    .showSaveDialog({
      filters,
    })
    .then(({ filePath, canceled }) => {
      if (canceled) return;
      mainWindow.webContents.send(command, filePath);
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
  mainWindow.webContents.send("save-image");
};

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
    submenu: [
      {
        label: "&Open Replay",
        accelerator: "CmdOrCtrl+Shift+O",
        click: function () {
          showOpenReplay();
        },
      },
      {
        label: "Open &Map",
        click: function () {
          showOpenMap();
        },
      },
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
    ],
  },
  {
    label: "Replay Queue",
    submenu: [
      { label: "Add Replay" },
      { type: "separator" },
      { label: "Next Replay", accelerator: "CmdOrCtrl+Shift+N" },
      { type: "separator" },
      {
        label: "Queue",
        submenu: [{ label: "Flash vs Jaedong" }, { label: "Dark vs Snipe" }],
      },
    ],
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
