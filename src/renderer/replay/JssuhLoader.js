import ReplayParser from "./node_modules/jssuh";
import concat from "concat-stream";
import createScmExtractor from "scm-extractor";
import Chk from "bw-chk/lib";
import { Writable } from "stream";

import fs from "fs";

const echo = new Writable({
  write(chunk, enc, next) {
    next();
  },
});

export default {
  loadReplay: () =>
    new Promise((resolve, reject) => {
      //todo reject on failed stream
      const mapData = new Promise((resolve, reject) => {
        fs.createReadStream("./replay/fs.scx")
          .pipe(createScmExtractor())
          .pipe(
            concat((data) => {
              const chk = new Chk(data);
              chk
                .image(Chk.fsFileAccess("./bwdata"), 1024, 1025)
                .then((data) => {
                  chk.bitmap = data;
                  resolve(chk);
                });
            })
          );
      });

      const reppi = fs
        .createReadStream("./replay/game.rep")
        .pipe(new ReplayParser());

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
    }),
};
