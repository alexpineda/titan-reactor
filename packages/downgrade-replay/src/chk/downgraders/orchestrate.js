const BufferList = require("bl/BufferList");
const VersionDowngrader = require("./version");
const StringDowngrader = require("./string");
const CRGBDowngrader = require("./crgb");
const { Version } = require("../common");
const { uint32 } = require("../../util/alloc");

class Orchestrate {
  constructor(chunks, opts) {
    this.chunks = Object.freeze(chunks);

    const versionDowngrader = new VersionDowngrader();
    this.downgraders = [
      versionDowngrader,
      new StringDowngrader(),
      new CRGBDowngrader(),
    ];

    const version = versionDowngrader.read(
      this._getChunk(versionDowngrader.chunkName)[1]
    );
    this.isSCR =
      version === Version.SCR || version === Version.BroodwarRemastered;
  }

  _getChunk(chunkName) {
    return this.chunks.find(([name]) => name === chunkName);
  }

  downgrade() {
    const _omit = [];
    const _add = [];

    this.downgraders.forEach((downgrader) => {
      const chunk = this._getChunk(downgrader.chunkName);
      // if the chunk exists, downgrade it
      if (chunk) {
        _omit.push(downgrader.chunkName);
        const newChunk = downgrader.downgrade(chunk[1]);

        // if we're replacing it with something, do so
        if (newChunk) {
          // if there is existing chunks of the new name make sure we don't include them
          _omit.push(newChunk[0]);
          // add the downgraded chunk
          _add.push(newChunk);
        }
      }
    });

    const out = new BufferList();
    const outChunks = [
      ...this.chunks.filter(([name]) => !_omit.includes(name)),
      ..._add,
    ];

    for (const [name, buffer] of outChunks) {
      out.append(Buffer.from(name));
      out.append(uint32(buffer.length));
      out.append(buffer);
    }

    // return a Buffer
    return out.slice(0);
  }
}

module.exports = Orchestrate;
