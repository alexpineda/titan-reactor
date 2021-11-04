// import {
//   closeCascStorage,
//   openCascStorage,
//   readCascFile,
// } from "../../common/utils/casclib";
import { dialog, ipcMain } from "electron";

import {
  OPEN_DEMO_REPLAY,
  OPEN_FILE,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  SELECT_FOLDER,
  OPEN_CASCLIB,
  OPEN_CASCLIB_FILE,
  CLOSE_CASCLIB,
} from "../../common/ipc";
import { openFileBinary } from "../../common/utils/fs";
import browserWindows from "../browser-windows";

import * as casclib from "casclib";

let _storageHandle: any = null;
let _lastBwPath = "";

export const readCascFile = (filePath: string) => {
  try {
    return casclib.readFile(_storageHandle, filePath);
  } catch (e) {
    console.error("failed loading casc file, retrying open casc");
    casclib.openStorage(_lastBwPath);
    return casclib.readFile(_storageHandle, filePath);
  }
};
export default readCascFile;

export const openCascStorage = (bwPath: string) => {
  _lastBwPath = bwPath;
  if (_storageHandle) {
    casclib.closeStorage(_storageHandle);
  }
  _storageHandle = casclib.openStorageSync(bwPath);
};

export const closeCascStorage = () =>
  _storageHandle && casclib.closeStorage(_storageHandle);

ipcMain.handle(OPEN_CASCLIB, (_, bwPath) => {
  try {
    openCascStorage(bwPath);
    return true;
  } catch (e) {
    return false;
  }
});

ipcMain.handle(OPEN_CASCLIB_FILE, async (_, filepath) => {
  return await readCascFile(filepath);
});

ipcMain.handle(CLOSE_CASCLIB, () => {
  closeCascStorage();
});

ipcMain.handle(OPEN_FILE, async (_, filepath = "") => {
  return await openFileBinary(filepath);
});

const showOpen = function (isMap = false, defaultPath = "") {
  const filters = isMap
    ? [{ name: "Starcraft Map", extensions: ["scm", "scx"] }]
    : [{ name: "Starcraft Replay", extensions: ["rep"] }];
  const command = isMap ? OPEN_MAP_DIALOG : OPEN_REPLAY_DIALOG;
  const multiSelections = isMap
    ? ["openFile"]
    : ["openFile", "multiSelections"];
  dialog
    .showOpenDialog({
      properties: multiSelections as keyof typeof dialog.showOpenDialog,
      filters,
      defaultPath,
    })
    .then(({ filePaths, canceled }) => {
      if (canceled) return;
      browserWindows.main?.webContents.send(command, filePaths);
    })
    .catch((err) => {
      dialog.showMessageBox({
        type: "error",
        title: "Error Loading File",
        message: "There was an error loading this file: " + err.message,
      });
    });
};

export const showOpenReplay = showOpen.bind(null, false);
export const showOpenMap = showOpen.bind(null, true);

ipcMain.on(OPEN_DEMO_REPLAY, async () => {
  browserWindows.main?.webContents.send(OPEN_REPLAY_DIALOG, [
    `${__static}/demo.rep`,
  ]);
});

ipcMain.on(OPEN_MAP_DIALOG, async (_, defaultPath = "") => {
  showOpenMap(defaultPath);
});

ipcMain.on(OPEN_REPLAY_DIALOG, async (_, defaultPath = "") => {
  showOpenReplay(defaultPath);
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
