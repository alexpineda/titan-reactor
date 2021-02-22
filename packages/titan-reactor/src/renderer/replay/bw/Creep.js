import { range } from "ramda";

let randState = Date.now();

const rand = () => {
  randState = randState * 22695477 + 1;
  return (randState >> 16) & 0x7fff;
};

const creepRandomTileIndices = range(0, 256 * 256).map(() => {
  if (rand() % 100 < 4) {
    return 6 + (rand() % 7);
  } else {
    return rand() % 6;
  }
});

const creepEdgeNeighborsIndex = [];
const creepEdgeNeighborsIndexN = [];
const creepEdgeFrameIndex = [];

for (let i = 0; i != 0x100; i++) {
  let v = 0;
  if (i & 2) v |= 0x10;
  if (i & 8) v |= 0x24;
  if (i & 0x10) v |= 9;
  if (i & 0x40) v |= 2;
  if ((i & 0xc0) == 0xc0) v |= 1;
  if ((i & 0x60) == 0x60) v |= 4;
  if ((i & 3) == 3) v |= 0x20;
  if ((i & 6) == 6) v |= 8;
  if ((v & 0x21) == 0x21) v |= 0x40;
  if ((v & 0xc) == 0xc) v |= 0x40;
  creepEdgeNeighborsIndex[i] = v;
}

let n = 0;
for (let i = 0; i !== 128; i++) {
  let find;
  for (const neighbor of creepEdgeNeighborsIndex) {
    if (neighbor === i) {
      find = neighbor;
      break;
    }
  }
  if (find) {
    creepEdgeNeighborsIndexN[i] = n;
    ++n;
  }
}

for (let i = 0; i !== 0x100; i++) {
  creepEdgeFrameIndex[i] = creepEdgeNeighborsIndexN[creepEdgeNeighborsIndex[i]];
}

const dirs = [
  [1, 1],
  [0, 1],
  [-1, 1],
  [1, 0],
  [-1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [0, 0],
];

export default class Creep {
  constructor(mapWidth, mapHeight, mapTiles) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.mapTiles = mapTiles;
    this._creep = new Uint16Array(mapWidth * mapHeight);
    this._edges = new Uint8Array(mapWidth * mapHeight);
  }

  hasCreep(tilesBw, x, y) {
    return tilesBw.buffer._readU16(y * 4 * this.mapWidth + x * 4);
  }

  generate(tilesBw) {
    this._creep.fill(0);
    this._edges.fill(0);

    for (let x = 0; x < this.mapWidth; x++) {
      for (let y = 0; y < this.mapHeight; y++) {
        if (this.hasCreep(tilesBw, x, y)) {
          this._creep[tilesBw.offset] =
            creepRandomTileIndices[x + y * this.mapWidth];
        } else {
          let creepIndex = 0;
          for (const i = 0; i < 8; i++) {
            const addX = dirs[i][0];
            const addY = dirs[i][1];
            if (x + addX >= this.mapWidth) continue;
            if (y + addY >= this.mapHeight) continue;
            if (this.hasCreep(tilesBw, x + addX, y + addY)) {
              creepIndex |= 1 << i;
            } else {
              const creepFrame = creepEdgeFrameIndex[creepIndex];

              if (creepFrame) {
                this._edges[x + y * this.mapWidth] = creepFrame;
              }
            }
          }
        }
      }
    }
  }
}
