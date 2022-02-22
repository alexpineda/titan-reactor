import { promises as fsPromises } from "fs";
import path from "path";
import * as log from "../../../src/renderer/ipc";

export const readCascFile = (filePath: string) => {
  return fsPromises.readFile(`D:/dev/bwdata/${filePath}`);
};
export default readCascFile;

const _fileMatches = async (files: string[], fileName: string, dir: string, relDir: string) => {
  for (const file of files) {
    try {
      const fsStat = await fsPromises.stat(path.join(dir, file));
      if (
        fsStat.isFile() &&
        file.toLowerCase() === fileName.toLowerCase()
      ) {
        return path.join(relDir, file);
      }
    } catch (e: unknown) {
      log.error((e as Error).message);
    }
  }
};

const _getSubdirectories = async (dir: string) => {
  const files = await fsPromises.readdir(dir);
  const dirs = [];
  for (const file of files) {
    try {
      const fsStat = await fsPromises.stat(path.join(dir, file));
      if (fsStat.isDirectory()) {
        dirs.push(file);
      }
    } catch (e: unknown) {
      log.error((e as Error).message);
    }
  }
  return dirs;
};

const _findFile = async (fileName: string, dir: string, relDir = ""): Promise<string | undefined> => {
  const files = await fsPromises.readdir(dir);
  let match = await _fileMatches(files, fileName, dir, relDir);
  if (match) {
    return match;
  }

  const subdirs = await _getSubdirectories(dir);
  for (const subdir of subdirs) {
    match = await _findFile(fileName, path.join(dir, subdir), path.join(relDir, subdir));
    if (match) {
      return match;
    }
  }
};

export const findFile = async (fileName: string) => {
  return await _findFile(fileName, `D:/dev/bwdata/`);
};