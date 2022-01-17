const { Version } = require("./common");
const { uint8 } = require("./util/alloc");
const commandToBuf = require("./commands/sidegrade/cmd-to-buf");
const { CMDS } = require("./commands/commands");
const CommandsStream = require("./commands/commands-stream");

const dumpFrame = (buf, frame, frameBuf) => {
  buf.append(uint32(frame));
  buf.append(uint8(frameBuf.length));
  buf.append(frameBuf);
};

const convertCommands = (replay) => {
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
};
module.exports = convertCommands;
