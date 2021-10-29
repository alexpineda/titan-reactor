const parseReplay = require("./replay");
const downgradeReplay = require("./downgrade");
const CommandsStream = require("./commands/commands-stream");
const { CMDS } = require("./commands/commands");
const Chk = require("../libs/bw-chk");
const { ChkDowngrader } = require("downgrade-chk");

const areEqualArray = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && areEqual(a, b);

const areEqualBuffer = (a, b) =>
  a instanceof Buffer && b instanceof Buffer && a.compare(b) === 0;
const areEqual = (a, b, opts = {}) => {
  if (!a || !b) return false;
  var keysA = Object.keys(a);

  if (keysA.length !== Object.keys(b).length) {
    if (opts.reason) {
      return `keys length do not match`;
    }
    return false;
  }

  for (var i = 0; i < keysA.length; i++) {
    if (
      (!Object.prototype.hasOwnProperty.call(a, keysA[i]) ||
        !Object.is(a[keysA[i]], b[keysA[i]])) &&
      !areEqualArray(a[keysA[i]], b[keysA[i]]) &&
      !areEqualBuffer(a[keysA[i]], b[keysA[i]])
    ) {
      if (opts.reason) {
        return `key does not match "${keysA[i]}" ${a[keysA[i]]} vs ${
          b[keysA[i]]
        } `;
      }
      return false;
    }
  }
  return true;
};
const fs = require("fs");
const { format } = require("path");
fs.readFile(
  process.argv[2] || "./test/25555-Star_kras-PvT.rep",
  async (err, buf) => {
    try {
      const scrRep = await parseReplay(buf);

      const chkDowngrader = new ChkDowngrader();
      const classicRep = await downgradeReplay(scrRep, chkDowngrader);
      fs.writeFile(
        "./test/out.116.rep",
        classicRep,
        (err) => err && console.error(err)
      );
      const reloadedRep = await parseReplay(classicRep);
      const cmdsNew = new CommandsStream(reloadedRep.rawCmds).generate();
      const cmdsOg = new CommandsStream(scrRep.rawCmds).generate();

      let _oldv,
        _newv,
        _numcmdsOld = 0,
        _numcmdsNew = 0;

      while (true) {
        if (!_oldv) {
          const { value, done } = cmdsOg.next();
          if (done) {
            console.log("old:done");
            break;
          } else {
            _oldv = value;
          }
        }
        if (typeof _oldv === "number") {
          console.log("old:frame", _oldv, _numcmdsOld);
          _oldv = null;
          _numcmdsOld = 0;
          continue;
        }
        if (!_newv) {
          const { value, done } = cmdsNew.next();
          if (done) {
            console.log("new:done");
            break;
          } else {
            _newv = value;
          }
        }
        if (typeof _newv === "number") {
          console.log("new:frame", _newv, _numcmdsNew);
          _newv = null;
          _numcmdsNew = 0;
          continue;
        }

        if (!areEqual(_oldv, _newv)) {
          console.log(areEqual(_oldv, _newv, { reason: true }));
          console.log(_oldv);
          console.log(_newv);
          if (_oldv.id !== CMDS.CHAT.id && _newv.id !== CMDS.CHAT.id) {
            break;
          }
        }

        _numcmdsOld++;
        _numcmdsNew++;
        _oldv = null;
        _newv = null;
      }

      // const chk = new Chk(reloadedRep.chk);
    } catch (e) {
      throw e;
    }
  }
);
