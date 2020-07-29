import { TBL } from "./TBL";
import { openFileBinary } from "../fs";

test("TBL should parse images.tbl", async (done) => {
  openFileBinary(`${process.env.BWDATA}/arr/images.tbl`)
    .then((d) => {
      const table = TBL.parse(d);
      expect(table[0]).toBe(`zerg\\avenger.grp\u0000`);
      done();
    })
    .catch(done);
});

test("TBL should parse sfxdata.tbl", async (done) => {
  openFileBinary(`${process.env.BWDATA}/arr/sfxdata.tbl`)
    .then((d) => {
      const table = TBL.parse(d);
      expect(table[0]).toBe(`Zerg\\Drone\\ZDrErr00.WAV\u0000`);
      done();
    })
    .catch(done);
});
