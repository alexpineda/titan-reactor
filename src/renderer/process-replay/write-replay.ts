import BufferList from "bl";
import { HeaderMagicTitanReactor } from "./version";
import { writeBlock } from "./blocks";
import { uint32 } from "./util/alloc";
import { LMTS, writeLMTS } from "./parse-scr-section";

const writeReplay = async (rawHeader: Buffer, rawCmds: Buffer, chk: Buffer, limits: LMTS) => {
  const bl = new BufferList();

  await writeBlock(bl, uint32(HeaderMagicTitanReactor), false);

  await writeBlock(bl, writeLMTS(limits).slice(0), false);

  await writeBlock(bl, rawHeader, true);

  await writeBlock(bl, uint32(rawCmds.length), false);
  await writeBlock(bl, rawCmds, true);

  await writeBlock(bl, uint32(chk.byteLength), false);
  await writeBlock(bl, chk, true);

  return bl.slice(0);
};
export default writeReplay;
