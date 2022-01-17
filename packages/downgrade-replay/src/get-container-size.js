const CommandsStream = require("./commands/commands-stream");

const SCRContainerSize = 3400;
const BWContainerSize = 1700;

const _getContainerSize = (unitTag) => {
  if (unitTag >= 0x2000) {
    return SCRContainerSize;
  } else {
    return BWContainerSize;
  }
};

const getContainerSize = (rawCmds) => {
  const cmds = new CommandsStream(rawCmds);
  const g = cmds.generate();
  let command;
  
  try {
    while ((command = g.next().value)) {
      if (typeof command === "number") {
        continue;
      }

      if (command.skipped && !command.data) {
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

module.exports = getContainerSize;