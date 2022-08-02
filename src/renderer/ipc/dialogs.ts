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

export const openReplayDialog = async (multiSelect = false) => {
  return ipcRenderer.invoke(OPEN_REPLAY_DIALOG, multiSelect);
};

export const openMapDialog = async () => {
  return ipcRenderer.invoke(OPEN_MAP_DIALOG);
};

export const downloadUpdate = async (url: string) => {
  ipcRenderer.send(DOWNLOAD_UPDATE, url);
};

export const openUrl = async (url: string) => {
  ipcRenderer.send(OPEN_URL, url);
}