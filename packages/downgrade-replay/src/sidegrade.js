const { BufferList } = require("bl");

const { HeaderMagicTitanReactor, Version } = require("./common");
const { writeBlock, getBlockSize } = require("./blocks");
const { uint32, uint8 } = require("./util/alloc");
const commandToBuf = require("./commands/sidegrade/cmd-to-buf");
const { CMDS } = require("./commands/commands");
const CommandsStream = require("./commands/commands-stream");

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
const sidegradeReplay = async (replay, chkDowngrader) => {
  const bl = new BufferList();

  await writeBlock(bl, uint32(HeaderMagicTitanReactor), false);
  await writeBlock(bl, replay.rawHeader, true);

  const dumpFrame = (buf, frame, frameBuf) => {
    buf.append(uint32(frame));
    buf.append(uint8(frameBuf.length));
    buf.append(frameBuf);
  };

  const commandsBuf = new BufferList();
  let currFrame = 0;
  let frameBuf = new BufferList();
  var command;

  const cmds = new CommandsStream(replay.rawCmds);
  const g = cmds.generate();

  const isRemastered = replay.version === Version.remastered;

  try {
    while ((command = g.next().value)) {
      if (typeof command === "number") {
        if (command !== currFrame) {
          dumpFrame(commandsBuf, currFrame, frameBuf);
          frameBuf = new BufferList();
          currFrame = command;
        }
        continue;
      }

      if (command.skipped && !command.data) {
        continue;
      }

      const [id, data] = commandToBuf(command.id, command, isRemastered);
      if (data.length !== CMDS[id].length(data)) {
        throw new Error("saved length and command length do not match");
      }

      const overflowed = data.length + 2 + frameBuf.length > 255;

      if (overflowed) {
        dumpFrame(commandsBuf, currFrame, frameBuf);
        frameBuf = new BufferList();
      }

      frameBuf.append(uint8(command.player));
      frameBuf.append(uint8(id));
      frameBuf.append(data);
    }

    if (frameBuf.length) {
      dumpFrame(commandsBuf, currFrame, frameBuf);
    }
  } catch (e) {
    console.log("error", e);
  }
  await writeBlock(bl, uint32(commandsBuf.length), false);
  await writeBlock(bl, commandsBuf, true);

  console.log(commandsBuf.length, await getBlockSize(commandsBuf));

  const chk = chkDowngrader.downgrade(replay.chk.slice(0));
  await writeBlock(bl, uint32(chk.byteLength), false);
  await writeBlock(bl, chk, true);

  return bl.slice(0);
};
module.exports = sidegradeReplay;
