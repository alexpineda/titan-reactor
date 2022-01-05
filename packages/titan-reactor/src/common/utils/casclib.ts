import * as hardfile from "./casclib-hardfile";
import * as casclib from "casclib";
import { isCascStorage } from "../../../src/renderer/stores";
let _storageHandle: any;
let _lastBwPath: string;

export const  readCascFile = async (filePath: string) => {
  if (!isCascStorage()) {
    return hardfile.readCascFile(filePath);
  }
  return await casclib.readFile(_storageHandle, filePath);
  
};
export default readCascFile;

export const findFile = async (fileName: string) => {
  if (!isCascStorage()) {
    return hardfile.findFile(fileName);
  }
  const files = await casclib.findFiles(_storageHandle, `*${fileName}`);
  if (files.length === 0) {
      return undefined;
  }
  return files[0].fullName;
};

export const findFiles = async (fileName: string) => {
  if (!isCascStorage()) {
    throw new Error("Not implemented");
  }
  return (await casclib.findFiles(_storageHandle, `*${fileName}`)).map(({fullName}) => fullName);
};

export const openCascStorage = async (bwPath: string) => {
    console.log("isCascStorage", isCascStorage());
  if (!isCascStorage()) {
    return hardfile.openCascStorage(bwPath);
  }
  _lastBwPath = bwPath;
  if (_storageHandle) {
    casclib.closeStorage(_storageHandle);
  }
  _storageHandle = await casclib.openStorage(bwPath);
};

export const closeCascStorage = () => {
  if (!isCascStorage()) {
    return hardfile.closeCascStorage();
  }
  _storageHandle && casclib.closeStorage(_storageHandle);
};
