import * as casclib from "bw-casclib";

let _lastBwPath = "";

export const readCascFile = async (filePath: string) => {
  const handle = await casclib.openStorage(_lastBwPath);
  const buf = await casclib.readFile(handle, filePath);
  casclib.closeStorage(handle);
  return buf;
};

export const openCascStorage = async (bwPath: string) => {
  _lastBwPath = bwPath;
};
