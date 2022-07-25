import { ipcMain } from "electron";

import {
  OPEN_CASCLIB,
  OPEN_CASCLIB_FILE,
  OPEN_CASCLIB_BATCH,
} from "../../../common/ipc-handle-names";

import * as casclib from "./api";

ipcMain.handle(OPEN_CASCLIB, (_, bwPath) => {
  try {
    casclib.openCascStorage(bwPath);
    return true;
  } catch (e) {
    return false;
  }
});

ipcMain.handle(OPEN_CASCLIB_FILE, async (_, filepath: string, encoding: BufferEncoding) => {
  const buffer = await casclib.readCascFile(filepath);
  return encoding ? buffer.toString(encoding) : buffer;
});


//TODO ADD ERROR MESSAGIN
ipcMain.handle(OPEN_CASCLIB_BATCH, async (_, filepaths: string[], encoding: BufferEncoding) => {
  const buffers = [];
  for (const filepath of filepaths) {
    const buffer = await casclib.readCascFile(filepath);
    buffers.push(encoding ? buffer.toString(encoding) : buffer);
  }
  return buffers;
});
