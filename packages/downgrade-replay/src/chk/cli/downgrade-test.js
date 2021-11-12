const fs = require("fs");
const createScmExtractor = require("scm-extractor");
const concat = require("concat-stream");
const Chk = require("bw-chk");
const ChkDowngrader = require("../chk-downgrader");
const PNG = require("pngjs").PNG;

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

const map = process.argv[2] || "eclipse";
extractChk(`./test/${map}.scx`).then(async (chkBuf) => {
  console.log(`extracting ${map}`);
  const downgrader = new ChkDowngrader({ mtxm: true });
  const out = downgrader.downgrade(chkBuf);

  const chk = new Chk(out);
  const w = 256 * 8;
  const h = 256 * 8;
  const img = await chk.image(
    // 1.16 files
    Chk.fsFileAccess("C:\\Users\\alexp\\Downloads\\mpqeditor_en\\x64\\Work"),
    w,
    h
  );

  fs.writeFile(
    `./test/${map}.out.png`,
    PNG.sync.write(
      {
        width: w,
        height: h,
        color: true,
        alpha: false,
        data: img,
      },
      { inputColorType: 2, colorType: 2, inputHasAlpha: false }
    ),
    (err) => {}
  );

  fs.writeFile(`./test/${map}.out.chk`, out, (err) => {});
  console.log("complete");
});
