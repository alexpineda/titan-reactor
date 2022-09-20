import BufferList from "bl/BufferList";
import { uint8, uint32 } from "./util/alloc";
import { CMDS } from "./commands/commands";
import CommandsStream from "./commands/commands-stream";
import { Replay } from "./parse-replay";
import { log } from "@ipc/log";

const dumpFrame = (out: BufferList, frame: number, frameBuf: BufferList) => {
  out.append(uint32(frame));
  out.append(uint8(frameBuf.length));
  out.append(frameBuf);
};

export const writeCommands = (replay: Replay, ignoreList: number[] = []) => {
  const out = new BufferList();
  let currFrame = 0;
  let frameBuf = new BufferList();

  const commands = new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer);

  for (const command of commands.generate()) {
    if (typeof command === "number") {
      if (command !== currFrame) {
        dumpFrame(out, currFrame, frameBuf);
        frameBuf = new BufferList();
        currFrame = command;
      }
      continue;
    }

    if (command.isUnknown && !command.data) {
      continue;
    }

    if (!replay.header.players.find(p => p.id === command.player)) {
      continue;
    }

    // we're no longer downgrading
    // const [id, data] = commandToBuf(command.id, command, isRemastered);
    if (ignoreList.includes(command.id)) {
      continue;
    }
    const [id, data] = [command.id, command.data];

    //@ts-ignore
    if (data.length !== CMDS[id].length(data)) {
      throw new Error("saved length and command length do not match");
    }

    const overflowed = data.length + 2 + frameBuf.length > 255;

    if (overflowed) {
      dumpFrame(out, currFrame, frameBuf);
      frameBuf = new BufferList();
    }

    frameBuf.append(uint8(command.player));
    frameBuf.append(uint8(id));
    frameBuf.append(data);
  }

  if (frameBuf.length) {
    dumpFrame(out, currFrame, frameBuf);
  }
  return out.slice(0);
};


export const sanityCheckCommands = (replay: Replay, stopAfterFirstFailure = false) => {
  let currFrame = 0;

  log.verbose("sanity checking replay commands");
  const cmds = new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer);
  const invalids = [];

  for (const command of cmds.generate()) {
    if (invalids.length && stopAfterFirstFailure) {
      return invalids;
    }

    if (typeof command === "number") {
      if (command !== currFrame) {
        currFrame = command;
      }
      continue;
    }

    if (command.isUnknown && !command.data) {
      invalids.push({ ...command, reason: "unknown-command" });
      continue;
    }

    if (!replay.header.players.find(p => p.id === command.player)) {
      invalids.push({ ...command, reason: "invalid-player" });
      continue;
    }

    //@ts-ignore
    if (command.data.length !== CMDS[command.id].length(command.data)) {
      throw new Error("saved length and command length do not match");
    }
  }

  return invalids;
};
