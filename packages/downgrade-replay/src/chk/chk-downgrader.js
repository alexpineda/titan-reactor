const { getChkChunks } = require("./chunks");
const { Orchestrate } = require("./downgraders");

const DEFAULT_OPTIONS = {
  mtxm: false,
};

class ChkDowngrader {
  downgrade(buf, userOptions) {
    const opts = Object.assign({}, DEFAULT_OPTIONS, userOptions);
    const chunks = getChkChunks(buf);
    const orchestrate = new Orchestrate(chunks, opts);

    return orchestrate.downgrade();
  }
}

module.exports = ChkDowngrader;
