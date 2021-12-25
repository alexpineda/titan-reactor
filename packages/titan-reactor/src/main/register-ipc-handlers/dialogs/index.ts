import { ipcMain } from "electron";

import {
  OPEN_DEMO_REPLAY,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  SELECT_FOLDER,
} from "../../../common/ipc-handle-names";
import browserWindows from "../../windows";
import { showOpenFileDialog, showOpenFolderDialog } from "./api";

export const showOpenMapDialog = (defaultPath?: string) =>
  showOpenFileDialog({
    title: "Starcraft Map",
    extensions: ["scm", "scx"],
    command: OPEN_MAP_DIALOG,
    defaultPath,
  });

export const showOpenReplayDialog = (defaultPath?: string) =>
  showOpenFileDialog({
    title: "Starcraft Replay",
    extensions: ["rep"],
    command: OPEN_REPLAY_DIALOG,
    multiSelect: true,
    defaultPath,
  });

ipcMain.on(OPEN_DEMO_REPLAY, async () => {
  browserWindows.main?.webContents.send(OPEN_REPLAY_DIALOG, [
    `${__static}/demo.rep`,
  ]);
});

ipcMain.on(OPEN_MAP_DIALOG, async (_, defaultPath = "") => showOpenMapDialog(defaultPath));
ipcMain.on(OPEN_REPLAY_DIALOG, async (_, defaultPath = "") => showOpenReplayDialog(defaultPath));

ipcMain.on(SELECT_FOLDER, async (event, key) =>
  showOpenFolderDialog((filePaths) =>
    event.sender.send(SELECT_FOLDER, { key, filePaths })
  )
);
