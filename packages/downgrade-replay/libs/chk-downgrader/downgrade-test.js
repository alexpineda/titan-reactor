const { Duplex } = require("stream");
const fs = require("fs");
const iconv = require("iconv-lite");
const createScmExtractor = require("scm-extractor");
const concat = require("concat-stream");
const Chk = require("../bw-chk");
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
  const origChk = new Chk(chk);
  console.log(origChk);

  const downgraded = exportChunk(chk, "MTXM");
  fs.writeFile(`./test/${map}.mtxm`, downgraded, (err) => {});

  // fs.readFile("./test/out.chk", (err, data) => {
  //   const newChk = new Chk(data);
  //   console.log(newChk);
  // });
});
