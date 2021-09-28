import * as casclib from "casclib";

let _storageHandle;
let _lastBwPath;

export default (filePath) => {
  try {
    return casclib.readFile(_storageHandle, filePath);
  } catch (e) {
    console.log("failed loading casc file, retrying open casc");
    openStorage(_lastBwPath);
    return casclib.readFile(_storageHandle, filePath);
  }
};

export const openCascStorage = (bwPath) => {
  _lastBwPath = bwPath;
  console.log("opening CASC storage");
  if (_storageHandle) {
    closeStorage(_storageHandle);
  }
  _storageHandle = casclib.openStorageSync(bwPath);
};

export const closeCascStorage = () =>
  _storageHandle && casclib.closeStorage(_storageHandle);
