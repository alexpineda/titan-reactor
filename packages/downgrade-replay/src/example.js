const parseReplay = require("./replay");
const downgradeReplay = require("./downgrade");
const Chk = require("../libs/bw-chk");

const fs = require("fs");
fs.readFile(process.argv[2] || "./test/LastReplay.rep", async (err, buf) => {
  try {
    const scrRep = await parseReplay(buf);
    console.log(scrRep);

    const classicRep = await downgradeReplay(scrRep);
    fs.writeFile(
      "./test/out.116.rep",
      classicRep,
      (err) => err && console.error(err)
    );
    const reloadedRep = await parseReplay(classicRep);

    const chk = new Chk(reloadedRep.chk);
  } catch (e) {
    throw e;
  }
});
