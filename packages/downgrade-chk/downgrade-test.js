const fs = require("fs");
const createScmExtractor = require("scm-extractor");
const concat = require("concat-stream");
const downgradeChk = require("./chk-downgrader");
const exportChunk = require("./export-chunk");

const extractChk = (filename) =>
  new Promise((res, rej) =>
    fs
      .createReadStream(filename)
      .pipe(createScmExtractor())
      .pipe(
        concat((data) => {
          res(data);
        })
      )
  );

const map = "fs";
extractChk(`./test/${map}.scx`).then((chk) => {
  const downgraded = exportChunk(chk, "MTXM");
  fs.writeFile(`./test/${map}.mtxm`, downgraded, (err) => {});

  // fs.readFile("./test/out.chk", (err, data) => {
  //   const newChk = new Chk(data);
  //   console.log(newChk);
  // });
});
