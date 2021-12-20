import { ipcRenderer } from "electron";

import {
  OPEN_CASCLIB,
  OPEN_CASCLIB_FILE,
  CLOSE_CASCLIB,
} from "../../common/ipc-handle-names";

export const openCascStorage = async (bwPath: string) => {
  return await ipcRenderer.invoke(OPEN_CASCLIB, bwPath);
};

export const closeCascStorage = () => {
  ipcRenderer.invoke(CLOSE_CASCLIB);
};

export const readCascFile = async (filepath: string) => {
  return await ipcRenderer.invoke(OPEN_CASCLIB_FILE, filepath);
};
