const { parseReplay, convertReplayTo116 } = require(".");
const Chk = require("../libs/bw-chk");

const fs = require("fs");
fs.readFile(
  process.argv[2] || "./test/TestLastReplay.rep",
  async (err, buf) => {
    try {
      const scrRep = await parseReplay(buf);
      console.log(scrRep);

      const classicRep = await convertReplayTo116(buf);
      fs.writeFile("./test/out.116.rep", classicRep, (err) =>
        console.error(err)
      );
      const reloadedRep = await parseReplay(classicRep);

      const chk = new Chk(reloadedRep.chk);

      console.log(chk, reloadedRep);
    } catch (e) {
      throw e;
    }
  }
);
