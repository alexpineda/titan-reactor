import fs, { promises as fsPromises } from "fs";

export default async function fileExists(path) {
  try {
    await fsPromises.access(path, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
}