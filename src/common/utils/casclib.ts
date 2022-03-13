import * as hardfile from "./casclib-hardfile";
import * as casclib from "bw-casclib";
import settingsStore from "../../../src/renderer/stores/settings-store";
let _storageHandle: any;

export const readCascFile = async (filePath: string): Promise<Buffer> => {
  if (!settingsStore().isCascStorage) {
    return hardfile.readCascFile(filePath);
  }
  return await casclib.readFile(_storageHandle, filePath);

};

export const findFile = async (fileName: string) => {
  if (!settingsStore().isCascStorage) {
    return hardfile.findFile(fileName);
  }
  const files = await casclib.findFiles(_storageHandle, `*${fileName}`);
  if (files.length === 0) {
    return undefined;
  }
  return files[0].fullName;
};

export const findFiles = async (fileName: string) => {
  if (!settingsStore().isCascStorage) {
    throw new Error("Not implemented");
  }
  return (await casclib.findFiles(_storageHandle, `*${fileName}`)).map(({ fullName }) => fullName);
};

export const openCascStorage = async (bwPath: string) => {
  if (!settingsStore().isCascStorage) {
    return;
  }
  if (_storageHandle) {
    casclib.closeStorage(_storageHandle);
  }
  _storageHandle = await casclib.openStorage(bwPath);
};

export const closeCascStorage = () => {
  if (!settingsStore().isCascStorage) {
    return;
  }
  _storageHandle && casclib.closeStorage(_storageHandle);
};

export default readCascFile;
