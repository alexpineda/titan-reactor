import { Readable } from "stream";
import concat from "concat-stream";
import createScmExtractor from "scm-extractor";

export default (buffer: Buffer): Promise<Buffer> =>
  new Promise<Buffer>((res) => {
    Readable.from(buffer)
      .pipe(createScmExtractor())
      .pipe(
        concat((data: Buffer) => {
          res(data);
        })
      );
  });