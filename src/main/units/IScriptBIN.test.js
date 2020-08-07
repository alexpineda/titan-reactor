import { IScriptBIN } from "./IScriptBIN";

// import { writeFile } from "fs";
const writeFile = () => {};

test("IScriptBIN should parse iscript.bin", async (done) => {
  const iscript = new IScriptBIN(process.env.BWDATA);
  await iscript.load();
  writeFile("iscript.result.json", JSON.stringify(iscript.scripts), () => {});
  done();
});
