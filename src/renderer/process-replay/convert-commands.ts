import BufferList from "bl/BufferList";
import { Version } from "./version";
import { uint8, uint32 } from "./util/alloc";
import commandToBuf from "./commands/sidegrade/cmd-to-buf";
import { CMDS } from "./commands/commands";
import CommandsStream from "./commands/commands-stream";
import { Replay } from "./parse-replay";

const dumpFrame = (buf: BufferList, frame: number, frameBuf: BufferList) => {
  buf.append(uint32(frame));
  buf.append(uint8(frameBuf.length));
  buf.append(frameBuf);
};

const convertCommands = (replay: Replay, commandsBuf: BufferList) => {
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
      //@ts-ignore
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
export default convertCommands;
