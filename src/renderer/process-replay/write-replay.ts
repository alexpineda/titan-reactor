import BufferList from "bl";
import { HeaderMagicTitanReactor } from "./version";
import { writeBlock } from "./blocks";
import { uint32 } from "./util/alloc";
import getContainerSize from "./get-container-size";

const writeReplay = async (rawHeader: Buffer, rawCmds: Buffer, chk: Buffer) => {
  const bl = new BufferList();

  await writeBlock(bl, uint32(HeaderMagicTitanReactor), false);

  // reserve space for scr extra section
  await writeBlock(bl, uint32(0), false);

  //TODO: replace this with reading scr section
  const containerSize = getContainerSize(rawCmds);
  if (containerSize === undefined) {
    throw new Error("invalid container size");
  }
  await writeBlock(bl, uint32(containerSize), false);

  await writeBlock(bl, rawHeader, true);

  await writeBlock(bl, uint32(rawCmds.length), false);
  await writeBlock(bl, rawCmds, true);

  await writeBlock(bl, uint32(chk.byteLength), false);
  await writeBlock(bl, chk, true);

  return bl.slice(0);
};
export default writeReplay;
