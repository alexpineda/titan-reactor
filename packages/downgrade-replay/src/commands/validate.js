const CommandsStream = require("./commands-stream");
const commandToBuf = require("./cmd-to-buf");

// A helper to validate whether or not a downgrade will be successful.
const validateDowngrade = (replay) => {
  const cmds = new CommandsStream(replay.rawCmds);
  const g = cmds.generate();

  try {
    while ((command = g.next().value)) {
      if (typeof command === "number") {
        continue;
      }
      commandToBuf(command.id, command, true);
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
module.exports = validateDowngrade;
