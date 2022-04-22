import BufferList from "bl";

import {
  HeaderMagicClassic,
  HeaderMagicScrModern,
  HeaderMagicTitanReactor,
  Version,
} from "./version";
import parseHeader from "./parse-replay-header";
import { readBlock } from "./blocks";

const parseReplay = async (buf: Buffer) => {
  const bl = new BufferList();
  bl.append(buf);

  const magic = (await readBlock(bl, 4)).readUInt32LE(0);
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

  let containerSize;

  if (version === Version.remastered) {
    // FIXME: support scr sections, specifically ShieldBattery POV addition
    bl.consume(4);
  } else if (version === Version.titanReactor) {
    // const scrSection = await block(bl, 4);
    await readBlock(bl, 4);
    containerSize = (await readBlock(bl, 4)).readUInt32LE(0);
  }

  const rawHeader = await readBlock(bl, 0x279);
  const header = parseHeader(rawHeader);

  const cmdsSize = (await readBlock(bl, 4)).readUInt32LE(0);
  const rawCmds = await readBlock(bl, cmdsSize);

  const chkSize = (await readBlock(bl, 4)).readUInt32LE(0);
  const chk = await readBlock(bl, chkSize);

  const stormPlayerToGamePlayer = []
  for (let i = 0; i < 8; i++) {
    const offset = 0xa1 + 0x24 * i
    const stormId = rawHeader.readInt32LE(offset + 0x4)
    if (stormId >= 0) {
      stormPlayerToGamePlayer[stormId] = rawHeader.readUInt32LE(offset)
    }
  }

  return {
    version,
    rawHeader,
    header,
    rawCmds,
    chk,
    containerSize,
    stormPlayerToGamePlayer
  };
};

export default parseReplay;
export type Replay = Awaited<ReturnType<typeof parseReplay>>;