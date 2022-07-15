import { ipcMain, shell } from "electron";
import { whiteListRegex, whitelistUrls } from "../../whitelist-urls";

import {
  DOWNLOAD_UPDATE,
  OPEN_DEMO_REPLAY,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  OPEN_URL,
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

ipcMain.on(DOWNLOAD_UPDATE, async (_, url: string) => {
  if (url.startsWith("https://github.com/imbateam-gg/titan-reactor/releases")) {
    shell.openExternal(url, { activate: true })
  }
});

ipcMain.on(OPEN_URL, async (_, url: string) => {
  const isWhitelisted = whitelistUrls.some((whitelistedUrl) => whitelistedUrl === url) ||
    whiteListRegex.some((regex) => regex.test(url));

  if (isWhitelisted) {
    shell.openExternal(url, { activate: true })
  }
});
