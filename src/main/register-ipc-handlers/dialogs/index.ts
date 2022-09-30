import { ipcMain, shell } from "electron";
import { whiteListRegex, whitelistUrls } from "../../whitelist-urls";

import {
  DOWNLOAD_UPDATE,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  OPEN_URL,
  SHOW_FOLDER_DIALOG,
} from "common/ipc-handle-names";
import { showOpenFileDialog, showOpenFolderDialog } from "./api";

export const showOpenMapDialog = () =>
  showOpenFileDialog({
    title: "Starcraft Map",
    extensions: ["scm", "scx"],
  });

export const showOpenReplayDialog = (multiSelect = false) =>
  showOpenFileDialog({
    title: "Starcraft Replay",
    extensions: ["rep"],
    multiSelect,
  });

ipcMain.handle(OPEN_MAP_DIALOG, async () => showOpenMapDialog());
ipcMain.handle(OPEN_REPLAY_DIALOG, async (_, multiSelect = false) => showOpenReplayDialog(multiSelect));

ipcMain.handle(SHOW_FOLDER_DIALOG, () => showOpenFolderDialog());

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
