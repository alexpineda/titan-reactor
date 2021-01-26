import * as casclib from "casclib";

let _storageHandle;

export default (filePath) => {
  return casclib.readFile(filePath);
};

export const openStorage = (bwPath) => {
  if (_storageHandle) {
    closeStorage();
  }
  _storageHandle = casclib.openStorageSync(bwPath);
};

export const closeStorage = () => casclib.closeStorage(_storageHandle);
