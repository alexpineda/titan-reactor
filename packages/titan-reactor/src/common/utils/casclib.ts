export * from "./casclib-hardfile"
// import * as casclib from "casclib";
// let _storageHandle: any;
// let _lastBwPath: string;

// export const readCascFile = (filePath: string) => {
//   try {
//     return casclib.readFile(_storageHandle, filePath);
//   } catch (e) {
//     console.error("failed loading casc file, retrying open casc");
//     casclib.openStorage(_lastBwPath);
//     return casclib.readFile(_storageHandle, filePath);
//   }
// };
// export default readCascFile;

// export const openCascStorage = async (bwPath: string) => {
//   _lastBwPath = bwPath;
//   if (_storageHandle) {
//     casclib.closeStorage(_storageHandle);
//   }
//   _storageHandle = await casclib.openStorage(bwPath);
// };

// export const closeCascStorage = () =>
//   _storageHandle && casclib.closeStorage(_storageHandle);