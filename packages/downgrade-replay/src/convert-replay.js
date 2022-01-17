const { BufferList } = require("bl");
const { HeaderMagicTitanReactor } = require("./common");
const { writeBlock } = require("./blocks");
const { uint32 } = require("./util/alloc");
const getContainerSize = require("./get-container-size");

/**
 * This utility converts all formats to 1.16, including compression of blocks using implode.
 * However, it migrates all unit tags to SCR format. Why? Because everything is mostly setup here
 * and all I had to do was change openbw to support 3400 units and not 1.16 unit counts + zlib compression
 * and I'm not good at c++, so this is a side grade :D
 *
 * So, in summary:
 * Converts replay magic header to TitanReactor specific one since we're fiddling with the format
 * Compresses all blocks with implode
 * Converts SCR replay commands to 1.16 replay commands yet preserving the scr unit tags
 * Converts 1.16 replay command unit tags to SCR unit tags
 * Converts SCR CHK sections to 1.16 CHK sections
 */
const convertReplay = async (replay, chkDowngrader) => {
  const bl = new BufferList();

  await writeBlock(bl, uint32(HeaderMagicTitanReactor), false);

  // reserve space for scr extra section
  await writeBlock(bl, uint32(0), false);

  const containerSize = getContainerSize(replay.rawCmds);
  await writeBlock(bl, uint32(containerSize), false);

  await writeBlock(bl, replay.rawHeader, true);

  await writeBlock(bl, uint32(replay.rawCmds.length), false);
  await writeBlock(bl, replay.rawCmds, true);

  const chk = chkDowngrader.downgrade(replay.chk.slice(0));
  await writeBlock(bl, uint32(chk.byteLength), false);
  await writeBlock(bl, chk, true);

  return bl.slice(0);
};
module.exports = convertReplay;
