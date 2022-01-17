const { BufferList } = require("bl");

const {
  HeaderMagicClassic,
  HeaderMagicScrModern,
  HeaderMagicTitanReactor,
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
  } else if (magic === HeaderMagicScrModern) {
    version = Version.remastered;
  } else if (magic === HeaderMagicTitanReactor) {
    version = Version.titanReactor;
  } else {
    throw new Error("not a replay");
  }

  if (version === Version.remastered) {
    // @todo support scr sections, specifically ShieldBattery POV addition
    bl.consume(4);
  } else if (version === Version.titanReactor) {
    const scrSection = await block(bl, 4);
    const containerSize = await block(bl, 4);
  }

  const rawHeader = await block(bl, 0x279);
  const header = parseHeader(rawHeader);

  const cmdsSize = (await block(bl, 4)).readUInt32LE(0);
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
