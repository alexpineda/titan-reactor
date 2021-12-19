import fs from "fs";
import BufferList from "bl";

export function readFile(filepath: string) {
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
