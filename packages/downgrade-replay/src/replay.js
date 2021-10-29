const { BufferList } = require("bl");

const {
  HeaderMagicClassic,
  HeaderMagicScrModern,
  Version,
} = require("./common");
const parseHeader = require("./header");
const { block } = require("./blocks");

const parseReplay = async (buf) => {
  const bl = new BufferList();
  bl.append(buf);

  const magic = (await block(bl, 4)).readUInt32LE(0);
  let version = -1;

  if (magic === HeaderMagicClassic) {
    version = Version.classic;
    console.log("replay: classic");
  } else if (magic === HeaderMagicScrModern) {
    version = Version.remastered;
    console.log("replay: remastered");
  } else {
    throw new Error("not a replay");
  }

  if (version === Version.remastered) {
    // @todo support scr sections
    bl.consume(4);
  }

  const rawHeader = await block(bl, 0x279);
  const header = parseHeader(rawHeader);

  const cmdsSize = (await block(bl, 4)).readUInt32LE(0);

  // ai reps tend to have MBs of commands so just skip processing these types of reps
  //@todo maybe have a seperate component to stream these afterward
  const rawCmds = await block(bl, cmdsSize);

  const chkSize = (await block(bl, 4)).readUInt32LE(0);
  const chk = await block(bl, chkSize);

  return {
    version,
    rawHeader,
    header,
    rawCmds,
    chk,
  };
};

module.exports = parseReplay;
