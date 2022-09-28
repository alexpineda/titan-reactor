import BufferList from "bl";

import {
  HeaderMagicClassic,
  HeaderMagicScrModern,
  HeaderMagicTitanReactor,
  Version,
} from "./version";
import parseHeader from "./parse-replay-header";
import { readBlock } from "./blocks";
import { parseLMTS, parseSCRSection } from "./parse-scr-section";

export const parseReplay = async (buf: Buffer) => {
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

  let limits = {
    images: 5000,
    sprites: 2500,
    thingies: 0,
    units: 1700,
    bullets: 100,
    orders: 2000,
    fogSprites: 0
  };
  let scrOffset: number | null = null;

  if (version === Version.remastered) {
    scrOffset = bl.readUInt32LE(0);
    bl.consume(4);
  } else if (version === Version.titanReactor) {
    limits = parseLMTS(await readBlock(bl, 0x1c));
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

  if (version === Version.remastered && scrOffset !== null) {
    const scr = new BufferList(buf.subarray(scrOffset));
    limits = await parseSCRSection(scr) ?? limits;
  }

  return {
    version,
    rawHeader,
    header,
    rawCmds,
    chk,
    limits,
    stormPlayerToGamePlayer
  };
};

export type Replay = Awaited<ReturnType<typeof parseReplay>>;