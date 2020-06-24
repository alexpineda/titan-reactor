import ReplayParser from "jssuh";
import concat from "concat-stream";
import createScmExtractor from "scm-extractor";
import Chk from "bw-chk";
import { Writable } from "stream";

const fs = window.require("fs");

const echo = new Writable({
  write(chunk, enc, next) {
    console.log(chunk, enc);
    next();
  },
});

export const jssuhLoadReplay = (bwDataPath, replayFile, mapFile) =>
  new Promise((resolve, reject) => {
    //todo reject on failed stream
    const mapData = new Promise((resolve, reject) => {
      fs.createReadStream(mapFile)
        .pipe(createScmExtractor())
        .pipe(concat((data) => resolve(new Chk(data))));
    });

    const reppi = fs.createReadStream(replayFile).pipe(new ReplayParser());

    const header = new Promise((resolve) => {
      reppi.on("replayHeader", resolve);
    });

    reppi.on("error", reject);

    reppi.pipeChk(Chk.createStream((data) => console.log("c", data)));

    const commands = new Promise((resolve) => reppi.pipe(concat(resolve)));

    Promise.all([header, commands, mapData]).then(
      ([header, commands, mapData]) => {
        resolve({
          header,
          commands,
          mapData,
        });
      }
    );
  });
