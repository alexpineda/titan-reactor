import BufferList from "bl";

import {
  HeaderMagicClassic,
  HeaderMagicScrModern,
  HeaderMagicTitanReactor,
  Version,
} from "./version";
import parseHeader from "./header";
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

  return {
    version,
    rawHeader,
    header,
    rawCmds,
    chk,
    containerSize,
  };
};

export default parseReplay;
export type Replay = Awaited<ReturnType<typeof parseReplay>>;