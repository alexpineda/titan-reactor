import BufferList from "bl";

// a wrapper for a bw frames entire game state
export default class FrameBW {
  processed = false;
  frame = 0;
  minerals: number[][] = [];
  gas: number[][] = [];
  supplyUsed: number[][] = [];
  supplyAvailable: number[][] = [];
  workerSupply: number[][] = [];
  tilesCount = 0;
  creepCount = 0;
  unitCount = 0;
  spriteCount = 0;
  imageCount = 0;
  soundCount = 0;
  researchCount = 0;
  upgradeCount = 0;
  buildingQueueCount = 0;
  buffers: Record<string, Buffer>;

  constructor() {
    this.buffers = {};
  }

  setBuffer(
    buffer: string,
    src: BufferList | Buffer,
    pos: number,
    copySize: number
  ) {
    this.buffers[buffer] = src.slice(pos, pos + copySize);
  }

  get sprites() {
    return this.buffers.sprites;
  }

  get images() {
    return this.buffers.images;
  }

  get units() {
    return this.buffers.units;
  }

  get tiles() {
    return this.buffers.tiles;
  }

  get sounds() {
    return this.buffers.sounds;
  }

  get creep() {
    return this.buffers.creep;
  }

  get buildingQueue() {
    return this.buffers.buildingQueue;
  }

  get research() {
    return this.buffers.research;
  }

  get upgrades() {
    return this.buffers.upgrades;
  }
}
