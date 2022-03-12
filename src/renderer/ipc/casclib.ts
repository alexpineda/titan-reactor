import { ipcRenderer } from "electron";

import {
  OPEN_CASCLIB,
  OPEN_CASCLIB_FILE,
  OPEN_CASCLIB_BATCH,
  CLOSE_CASCLIB,
} from "../../common/ipc-handle-names";

export const openCascStorage = async (bwPath: string) => {
  return await ipcRenderer.invoke(OPEN_CASCLIB, bwPath);
};

export const closeCascStorage = () => {
  ipcRenderer.invoke(CLOSE_CASCLIB);
};

export const readCascFile = async (filepath: string) => {
  const arrayBuffer = await ipcRenderer.invoke(OPEN_CASCLIB_FILE, filepath);
  return Buffer.from(arrayBuffer.buffer);
};

export const readCascFileBatch = async (filepaths: string[]) => {
  const arrayBuffers = await ipcRenderer.invoke(OPEN_CASCLIB_BATCH, filepaths);
  return arrayBuffers.map((b: Uint8Array) => Buffer.from(b.buffer));
};

