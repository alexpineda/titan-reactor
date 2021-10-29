const { BufferList } = require("bl");
const { chkDowngrader } = require("downgrade-chk");

const { HeaderMagicClassic, Version } = require("./common");
const { writeBlock } = require("./blocks");
const { uint32, uint8 } = require("./util/alloc");
const commandToBuf = require("./commands/cmd-to-buf");
const { CMDS } = require("./commands/commands");
const CommandsStream = require("./commands/commands-stream");

const downgradeReplay = async (replay) => {
  if (replay.version === Version.classic) {
    return replay;
  }
  const bl = new BufferList();

  await writeBlock(bl, uint32(HeaderMagicClassic), false);
  await writeBlock(bl, replay.rawHeader, true);

  const dumpFrame = (buf, frame, frameBuf) => {
    buf.append(uint32(frame));
    buf.append(uint8(frameBuf.length));
    buf.append(frameBuf);
  };

  const commandsBuf = new BufferList();
  let prevFrame = 0;
  let frameBuf = new BufferList();
  var command;

  const cmds = new CommandsStream(replay.rawCmds);
  const g = cmds.generate();
  try {
    while ((command = g.next().value)) {
      if (typeof command === "number" && command !== prevFrame) {
        dumpFrame(commandsBuf, prevFrame, frameBuf);
        frameBuf = new BufferList();
        prevFrame = command;
        continue;
      }

      if (command.skipped && !command.data) {
        continue;
      }

      const [id, data] = commandToBuf(command.id, command);
      if (data.length !== CMDS[id].length(data)) {
        throw new Error("saved length and command length do not match");
      }

      const overflowed = data.length + 2 + frameBuf.length > 255;

      if (overflowed) {
        dumpFrame(
          commandsBuf,
          overflowed ? command.frame : prevFrame,
          frameBuf
        );
        frameBuf = new BufferList();
      }

      frameBuf.append(uint8(command.player));
      frameBuf.append(uint8(id));
      frameBuf.append(data);
    }
  } catch (e) {
    console.log("error", e);
  }
  if (frameBuf.length) {
    dumpFrame(commandsBuf, cmds.currentFrame, frameBuf);
  }

  await writeBlock(bl, uint32(commandsBuf.length), false);
  await writeBlock(bl, commandsBuf, true);

  const chk = chkDowngrader(replay.chk.slice(0));
  await writeBlock(bl, uint32(chk.byteLength), false);
  await writeBlock(bl, chk, true);

  return bl.slice(0);
};
module.exports = downgradeReplay;
