import CommandsStream from "./commands/commands-stream";
import { Replay } from "./parse-replay";

const SCRContainerSize = 3400;
const BWContainerSize = 1700;

const _getContainerSize = (unitTag: number) => {
  if (unitTag >= 0x2000) {
    return SCRContainerSize;
  } else {
    return BWContainerSize;
  }
};

const getContainerSize = (replay: Replay) => {
  const cmds = new CommandsStream(replay.rawCmds, replay.stormPlayerToGamePlayer);

  try {
    for (const command of cmds.generate()) {
      if (typeof command === "number") {
        continue;
      }

      if (command.isUnknown && !command.data) {
        continue;
      }

      if (command.unitTag) {
        return _getContainerSize(command.unitTag);
      } else if (command.unitTags) {
        return _getContainerSize(command.unitTags[0]);
      }
    }
  } catch (e) {
    console.log("error", e);
  }
};

export default getContainerSize;