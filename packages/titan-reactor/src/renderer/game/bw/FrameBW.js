export default class FrameBW {
  constructor() {
    this.processed = false;
    this.frame = 0;
    this.minerals = [];
    this.gas = [];
    this.supplyUsed = [];
    this.supplyAvailable = [];
    this.workerSupply = [];

    this.tilesCount = 0;
    this.creepCount = 0;
    this.unitCount = 0;
    this.spriteCount = 0;
    this.imageCount = 0;
    this.soundCount = 0;
    this.buildingQueueCount = 0;
    this.buffers = {};
  }

  setBuffer(buffer, src, pos, copySize) {
    this.buffers[buffer] = src.shallowSlice(pos, pos + copySize);
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
}
