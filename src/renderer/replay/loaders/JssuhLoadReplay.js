import ReplayParser from "jssuh";
import concat from "concat-stream";
import { imageChk } from "../../utils/loadChk";
import Chk from "../../../../bw-chk";
import { Writable } from "stream";
import fs from "fs";

const echo = new Writable({
  write(chunk, enc, next) {
    console.log(chunk, enc);
    next();
  },
});

export const jssuhLoadReplay = (replayFile, bwDataPath) => {
  const reppi = fs.createReadStream(replayFile).pipe(new ReplayParser());
  const headerPromise = new Promise((resolve) => {
    reppi.on("replayHeader", (header) => {
      console.log(header);
      resolve(header);
    });
  });

  const chkPromise = new Promise((res, rej) => {
    reppi.pipeChk(
      Chk.createStream((err, data) => {
        if (err) return rej(err);
        // console.log("chkPromise", imageChk(data));
        res(imageChk(data, bwDataPath));
      })
    );
  });

  const commandsPromise = new Promise((resolve) => reppi.pipe(concat(resolve)));

  return new Promise((resolve, reject) => {
    reppi.on("error", reject);

    Promise.all([headerPromise, commandsPromise, chkPromise]).then(
      ([header, commands, chk]) => {
        resolve({
          header,
          commands,
          chk,
        });
      }
    );
  });
};
