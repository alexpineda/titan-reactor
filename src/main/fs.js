import fs, { promises as fsPromises } from "fs";
import BufferList from "bl";
import path from "path";

export function openFileBinary(filepath) {
  return new Promise((res, rej) => {
    fs.createReadStream(filepath).pipe(
      new BufferList((err, buf) => {
        if (err) {
          rej(err);
        } else {
          res(buf);
        }
      }).on("error", rej)
    );
  });
}

//very naive extension matching, no globbing
export async function searchFiles(dir, fileExt, files = []) {
  const filenames = await fsPromises.readdir(dir);

  for (let filename of filenames) {
    const filepath = path.join(dir, filename);
    const stat = await fsPromises.lstat(filepath);
    if (stat.isDirectory()) {
      await searchFiles(path.join(dir, filename), fileExt, files);
    } else if (filename.includes(fileExt)) {
      files.push(filepath);
    }
  }

  return files;
}

export function openFileLines(filepath, windows = true) {
  return new Promise((res, rej) => {
    fs.readFile(filepath, "utf8", function (err, data) {
      if (err) rej(err);
      res(data.split(windows ? "\r\n" : "\n"));
    });
  });
}
