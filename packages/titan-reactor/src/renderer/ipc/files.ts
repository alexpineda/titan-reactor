import { Buffer } from "buffer/";
import { ipcRenderer } from "electron";

import { OPEN_FILE } from "../../common/ipc-handle-names";

export const openFile = async (filepath: string) => {
  const result = await ipcRenderer.invoke(OPEN_FILE, filepath);
  return new Buffer(result);
};
