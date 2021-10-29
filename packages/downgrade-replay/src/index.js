// based HEAVILY on jssuh, screp & openbw <3
const parseReplay = require("./replay");
const convertReplayTo116 = require("./downgrade");
const CommandsStream = require("./commands/commands-stream");
const { Version } = require("./common");

module.exports = {
  parseReplay,
  convertReplayTo116,
  Version,
  CommandsStream,
};
