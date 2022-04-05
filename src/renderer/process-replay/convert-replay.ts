import BufferList from "bl";
import { HeaderMagicTitanReactor } from "./version";
import { writeBlock } from "./blocks";
import { uint32 } from "./util/alloc";
import getContainerSize from "./get-container-size";
import ChkDowngrader from "./chk/chk-downgrader";
import { Replay } from "./parse-replay";

const convertReplay = async (replay: Replay, chkDowngrader: ChkDowngrader) => {
  const bl = new BufferList();

  await writeBlock(bl, uint32(HeaderMagicTitanReactor), false);

  // reserve space for scr extra section
  await writeBlock(bl, uint32(0), false);

  //TODO: replace this with reading scr section
  const containerSize = getContainerSize(replay.rawCmds);
  if (containerSize === undefined) {
    throw new Error("invalid container size");
  }
  await writeBlock(bl, uint32(containerSize), false);

  await writeBlock(bl, replay.rawHeader, true);

  await writeBlock(bl, uint32(replay.rawCmds.length), false);
  await writeBlock(bl, replay.rawCmds, true);

  const chk = chkDowngrader.downgrade(replay.chk.slice(0));
  await writeBlock(bl, uint32(chk.byteLength), false);
  await writeBlock(bl, chk, true);

  return bl.slice(0);
};
export default convertReplay;
