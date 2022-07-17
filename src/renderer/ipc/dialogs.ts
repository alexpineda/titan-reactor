import { ipcRenderer } from "electron";

import {
  DOWNLOAD_UPDATE,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  OPEN_URL,
  SHOW_FOLDER_DIALOG,
} from "common/ipc-handle-names";

export const showFolderDialog = async () => {
  return await ipcRenderer.invoke(SHOW_FOLDER_DIALOG);
};

export const openReplayDialog = async (filepath: string) => {
  ipcRenderer.send(OPEN_REPLAY_DIALOG, filepath);
};

export const openMapDialog = async (filepath: string) => {
  ipcRenderer.send(OPEN_MAP_DIALOG, filepath);
};

export const downloadUpdate = async (url: string) => {
  ipcRenderer.send(DOWNLOAD_UPDATE, url);
};

export const openUrl = async (url: string) => {
  ipcRenderer.send(OPEN_URL, url);
}