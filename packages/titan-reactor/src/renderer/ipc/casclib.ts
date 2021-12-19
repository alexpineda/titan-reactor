import { Buffer } from "buffer/";
import { ipcRenderer } from "electron";

import {
  OPEN_CASCLIB,
  OPEN_CASCLIB_FILE,
  CLOSE_CASCLIB,
} from "../../common/ipc-handle-names";

export const openCasclib = async (bwPath: string) => {
  return await ipcRenderer.invoke(OPEN_CASCLIB, bwPath);
};

export const closeCasclib = () => {
  ipcRenderer.invoke(CLOSE_CASCLIB);
};

export const openCasclibFile = async (filepath: string) => {
  return new Buffer(await ipcRenderer.invoke(OPEN_CASCLIB_FILE, filepath));
};
