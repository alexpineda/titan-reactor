import { range } from "ramda";

//https://stackoverflow.com/questions/6232939/is-there-a-way-to-correctly-multiply-two-32-bit-integers-in-javascript/6422061
function multiply_uint32(a, b) {
  var ah = (a >> 16) & 0xffff,
    al = a & 0xffff;
  var bh = (b >> 16) & 0xffff,
    bl = b & 0xffff;
  var high = (ah * bl + al * bh) & 0xffff;
  return ((high << 16) >>> 0) + al * bl;
}

//uint32_t rand_state = (uint32_t)std::chrono::high_resolution_clock::now().time_since_epoch().count();
let randState = Date.now();

const rand = () => {
  randState = multiply_uint32(randState, 22695477) + 1;
  return (randState >>> 16) & 0x7fff;
};

const creepRandomTileIndices = range(0, 256 * 256).map(() => {
  if (rand() % 100 < 4) {
    return 6 + (rand() % 7);
  } else {
    return rand() % 6;
  }
});

const creepEdgeNeighborsIndex = new Uint8Array(0x100);
const creepEdgeNeighborsIndexN = new Uint8Array(128);
const creepEdgeFrameIndex = new Uint8Array(0x100);

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

let n = 1;
for (let i = 0; i !== 128; ++i) {
  const neighbour = creepEdgeNeighborsIndex.find(
    (neighbour) => neighbour === i
  );

  if (neighbour === undefined) {
    continue;
  }
  if (neighbour) {
    creepEdgeNeighborsIndexN[i] = n;
    ++n;
  }
}

for (let i = 0; i !== 0x100; ++i) {
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
  constructor(
    mapWidth,
    mapHeight,
    creepValuesTexture,
    creepEdgesValuesTexture
  ) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.creep = new Uint8Array(mapWidth * mapHeight);
    this.edges = new Uint8Array(mapWidth * mapHeight);
    this.creepValuesTexture = creepValuesTexture;
    this.creepEdgesValuesTexture = creepEdgesValuesTexture;
  }

  /**
   *
   * @param {CreepBW} creepBW
   */
  generate(creepBW) {
    this.creep.fill(0);
    this.edges.fill(0);

    for (let x = 0; x < this.mapWidth; x++) {
      for (let y = 0; y < this.mapHeight; y++) {
        if (creepBW.hasCreepAt(y * this.mapWidth + x)) {
          this.creep[x + y * this.mapWidth] =
            creepRandomTileIndices[x + y * this.mapWidth] + 1;
        } else {
          let creepIndex = 0;

          for (let i = 0; i < 9; i++) {
            const addX = dirs[i][0];
            const addY = dirs[i][1];

            if (x + addX >= this.mapWidth) continue;
            if (y + addY >= this.mapHeight) continue;
            if (x + addX < 0) continue;
            if (y + addY < 0) continue;

            const tilePos = (y + addY) * this.mapWidth + x + addX;

            if (creepBW.hasCreepAt(tilePos)) {
              creepIndex |= 1 << i;
            } else {
              const creepFrame = creepEdgeFrameIndex[creepIndex];

              if (creepFrame) {
                this.edges[x + y * this.mapWidth] = creepFrame;
              }
            }
          }
        }
      }
    }

    this.creepValuesTexture.image.data = this.creep;
    this.creepValuesTexture.needsUpdate = true;

    this.creepEdgesValuesTexture.image.data = this.edges;
    this.creepEdgesValuesTexture.needsUpdate = true;
  }
}
