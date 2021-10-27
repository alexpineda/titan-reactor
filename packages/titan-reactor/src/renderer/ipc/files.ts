import { Buffer } from "buffer/";
import { ipcRenderer } from "electron";

import { OPEN_DEMO_REPLAY, OPEN_FILE, OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG, SELECT_FOLDER } from "../../common/ipc";

export const openFile = async (filepath: string) => {
  const result = await ipcRenderer.invoke(OPEN_FILE, filepath);
  return new Buffer(result);
};

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
