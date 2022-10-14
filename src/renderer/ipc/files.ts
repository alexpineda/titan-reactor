import { BwDAT } from "common/types";
import { ipcRenderer } from "electron";

import { LOAD_DAT_FILES, OPEN_FILE } from "common/ipc-handle-names";

export const openFile = async (filepath: string) => {
  const arrayBuffer = await ipcRenderer.invoke(OPEN_FILE, filepath);
  return Buffer.from(arrayBuffer.buffer);
};

export const loadDatFilesRemote = async (): Promise<BwDAT> => {
  return await ipcRenderer.invoke(LOAD_DAT_FILES);
}