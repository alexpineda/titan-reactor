import * as hardfile from "./casclib-disk";

export const readCascFile = async (filePath: string): Promise<Buffer> => {
    return hardfile.readCascFile(filePath) as Promise<Buffer>;
};

export const findFile = async () => {
  return "";
};

export const findFiles = async () => {
  return [];
};

export const openCascStorage = async () => {};

export const closeCascStorage = () => {
};

export default readCascFile;
