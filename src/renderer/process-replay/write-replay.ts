import BufferList from "bl";
import { HeaderMagicTitanReactor } from "./version";
import { writeBlock } from "./blocks";
import { uint32 } from "./util/alloc";

const writeReplay = async (rawHeader: Buffer, rawCmds: Buffer, chk: Buffer, unitLimit: number) => {
  const bl = new BufferList();

  await writeBlock(bl, uint32(HeaderMagicTitanReactor), false);

  // reserve space for scr extra section
  await writeBlock(bl, uint32(0), false);

  //TODO: replace with entire SCR limits section
  await writeBlock(bl, uint32(unitLimit), false);

  await writeBlock(bl, rawHeader, true);

  await writeBlock(bl, uint32(rawCmds.length), false);
  await writeBlock(bl, rawCmds, true);

  await writeBlock(bl, uint32(chk.byteLength), false);
  await writeBlock(bl, chk, true);

  return bl.slice(0);
};
export default writeReplay;
