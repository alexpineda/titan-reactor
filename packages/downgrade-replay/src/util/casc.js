const casclib = require("casclib");

let _storageHandle;
let _lastBwPath;

const readCascFile = (filePath) => {
  try {
    return casclib.readFile(_storageHandle, filePath);
  } catch (e) {
    console.error("failed loading casc file, retrying open casc");
    casclib.openStorage(_lastBwPath);
    return casclib.readFile(_storageHandle, filePath);
  }
};

const openCascStorage = (bwPath) => {
  _lastBwPath = bwPath;
  if (_storageHandle) {
    casclib.closeStorage(_storageHandle);
  }
  _storageHandle = casclib.openStorageSync(bwPath);
};

const closeCascStorage = () =>
  _storageHandle && casclib.closeStorage(_storageHandle);

module.exports = {
  readCascFile,
  openCascStorage,
  closeCascStorage,
};
