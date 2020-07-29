import fs from "fs";
import BufferList from "bl";

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

export function openFileLines(filepath, windows = true) {
  return new Promise((res, rej) => {
    fs.readFile(filepath, "utf8", function (err, data) {
      if (err) rej(err);
      res(data.split(windows ? "\r\n" : "\n"));
    });
  });
}
