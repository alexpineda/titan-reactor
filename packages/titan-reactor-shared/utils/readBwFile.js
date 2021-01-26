import * as casclib from "casclib";

let _storageHandle;

export default (filePath) => {
  return casclib.readFile(_storageHandle, filePath);
};

export const openStorage = (bwPath) => {
  if (_storageHandle) {
    closeStorage();
  }
  _storageHandle = casclib.openStorageSync(bwPath);
};

export const closeStorage = () =>
  _storageHandle && casclib.closeStorage(_storageHandle);
