import fs from "fs";
import HashThrough from "./hashThrough";
import { streamEndPromise } from "./streamPromise";

export default async function getFileHash(filePath) {
  const hasher = new HashThrough();
  const fileStream = fs.createReadStream(filePath);
  const fsPromise = streamEndPromise(fileStream);
  fileStream.pipe(hasher);
  hasher.resume();

  const [hash] = await Promise.all([hasher.hashPromise, fsPromise]);
  return hash;
}
