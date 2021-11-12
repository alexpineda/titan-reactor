const mappings = require("downgrade-replay-tile-matches/matches.json");
const BufferList = require("bl/BufferList");
const { uint16 } = require("../../util/alloc");

class MtxmDowngrader {
  constructor(getChunks) {
    this.chunkName = "MTXM";
    this.tileset = getChunks("ERA\x20")[1].readUint16LE(0) & 0x7;
    const dim = getChunks("DIM\x20")[1];
    this.mapWidth = dim.readUint16LE(0);
    this.mapHeight = dim.readUint16LE(2);

    this.mapping = mappings[this.tileset].matches;
  }

  downgrade(buffer) {
    const out = new BufferList();
    for (let mapY = 0; mapY < this.mapHeight; mapY++) {
      for (let mapX = 0; mapX < this.mapWidth; mapX++) {
        const tile = buffer.readUint16LE(mapX * 2 + mapY * this.mapWidth * 2);
        const [_, match] = this.mapping.find(([scr]) => scr === tile) || [];

        if (match) {
          out.append(uint16(match));
        } else {
          out.append(uint16(tile));
        }
      }
    }
    return [this.chunkName, out];
  }
}

module.exports = MtxmDowngrader;
