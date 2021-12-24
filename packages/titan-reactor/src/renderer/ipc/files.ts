import { ipcRenderer } from "electron";

import { OPEN_FILE } from "../../common/ipc-handle-names";

export const openFile = async (filepath: string) => {
  const arrayBuffer = await ipcRenderer.invoke(OPEN_FILE, filepath);
  return Buffer.from(arrayBuffer.buffer);
};
