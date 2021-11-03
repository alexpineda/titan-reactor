const mappings = require("../../../mappings.json");
const BufferList = require("bl/BufferList");
const { uint16 } = require("../../util/alloc");

class MtxmDowngrader {
  constructor(getChunks) {
    this.chunkName = "MTXM";
    this.tileset = getChunks("ERA\x20")[1].readUint16LE(0) & 0x7;
    const dim = getChunks("DIM\x20")[1];
    this.mapWidth = dim.readUint16LE(0);
    this.mapHeight = dim.readUint16LE(2);

    this.partial = mappings[this.tileset].partial;
    this.mapping = mappings[this.tileset].matches;
  }

  downgrade(buffer) {
    const out = new BufferList();
    for (let mapY = 0; mapY < this.mapHeight; mapY++) {
      for (let mapX = 0; mapX < this.mapWidth; mapX++) {
        const tile = buffer.readUint16LE(mapX * 2 + mapY * this.mapWidth * 2);
        const match = this.mapping.find(([scr]) => scr.id === tile);

        if (match) {
          const group = match[1].groupIndex << 4;
          const index = match[1].index & 0xf;
          const newTile = group | index;
          out.append(uint16(newTile));
        } else {
          out.append(uint16(tile));
        }
      }
    }
    return [this.chunkName, out];
  }
}

module.exports = MtxmDowngrader;
