const fs = require("fs");
const parseReplay = require("../replay");
const downgradeReplay = require("../sidegrade");
const { ChkDowngrader } = require("../chk");

fs.readFile(process.argv[2] || "./test/dm2.rep", async (err, buf) => {
  try {
    const scrRep = await parseReplay(buf);

    const chkDowngrader = new ChkDowngrader({ mtxm: false });
    const classicRep = await downgradeReplay(scrRep, chkDowngrader);
    fs.writeFile(
      "./test/out.116.rep",
      classicRep,
      (err) => err && console.error(err)
    );
  } catch (e) {
    throw e;
  }
});
