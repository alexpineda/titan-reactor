
import concat from "concat-stream";
import createScmExtractor from "scm-extractor";
import fs from "fs";

export default (filename: string) =>
  new Promise((res) =>
    fs
      .createReadStream(filename)
      .pipe(createScmExtractor())
      .pipe(
        concat((data: Buffer) => {
          res(data);
        })
      )
  );
