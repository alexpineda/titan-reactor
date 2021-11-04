// based HEAVILY on jssuh, screp & openbw <3
const parseReplay = require("./replay");
const downgradeReplay = require("./downgrade");
const validateDowngrade = require("./commands/validate");
const CommandsStream = require("./commands/commands-stream");
const { Version } = require("./common");
const { ChkDowngrader } = require("./chk");

module.exports = {
  parseReplay,
  downgradeReplay,
  Version,
  CommandsStream,
  validateDowngrade,
  ChkDowngrader,
};
