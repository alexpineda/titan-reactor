const { Version } = require("../common");
const { uint16 } = require("../../util/alloc");
class VersionDowngrader {
  constructor() {
    this.chunkName = "VER\x20";
  }

  read(buffer) {
    return buffer.readUInt16LE(0);
  }

  downgrade(buffer) {
    const version = buffer.readUInt16LE(0);
    const newVersion = uint16(
      version === Version.SCR ? Version.Hybrid : Version.Broodwar
    );

    return [this.chunkName, newVersion];
  }
}

module.exports = VersionDowngrader;
