import { ipcRenderer } from "electron";

import {
  DOWNLOAD_UPDATE,
  OPEN_DEMO_REPLAY,
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  OPEN_URL,
  SELECT_FOLDER,
} from "common/ipc-handle-names";

export const selectFolder = async (key: string) => {
  return await ipcRenderer.send(SELECT_FOLDER, key);
};

export const openReplayDialog = async (filepath: string) => {
  ipcRenderer.send(OPEN_REPLAY_DIALOG, filepath);
};

export const openMapDialog = async (filepath: string) => {
  ipcRenderer.send(OPEN_MAP_DIALOG, filepath);
};

export const openDemoReplay = async () => {
  ipcRenderer.send(OPEN_DEMO_REPLAY);
};

export const downloadUpdate = async (url: string) => {
  ipcRenderer.send(DOWNLOAD_UPDATE, url);
};

export const openUrl = async (url: string) => {
  ipcRenderer.send(OPEN_URL, url);
}