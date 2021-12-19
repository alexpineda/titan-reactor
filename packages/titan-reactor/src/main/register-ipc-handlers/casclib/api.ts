import * as casclib from "casclib";

let _storageHandle: any = null;
let _lastBwPath = "";
let _retries = 0;

export const readCascFile = (filePath: string) => {
  if (_retries > 3) {
    throw new Error("failed loading casc file");
  }

  try {
    return casclib.readFile(_storageHandle, filePath);
  } catch (e) {
    console.error("failed loading casc file, retrying open casc");
    _retries++;
    casclib.openStorage(_lastBwPath);
    return casclib.readFile(_storageHandle, filePath);
  }
};

export const openCascStorage = (bwPath: string) => {
  _lastBwPath = bwPath;
  if (_storageHandle) {
    casclib.closeStorage(_storageHandle);
  }
  _storageHandle = casclib.openStorageSync(bwPath);
};

export const closeCascStorage = () =>
  _storageHandle && casclib.closeStorage(_storageHandle);
