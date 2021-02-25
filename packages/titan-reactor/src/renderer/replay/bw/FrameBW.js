export default class FrameBW {
  constructor() {
    this.processed = false;
    this.frame = 0;
    this.tilesCount = 0;
    this.unitCount = 0;
    this.spriteCount = 0;
    this.imageCount = 0;
    this.soundCount = 0;
    this.buffers = {
      sprites: { length: 0 },
      images: { length: 0 },
      units: { length: 0 },
      tiles: { length: 0 },
      sounds: { length: 0 },
    };
  }

  setBuffer(buffer, src, copySize) {
    if (copySize > this.buffers[buffer].length) {
      console.log(`resize from ${this.buffers[buffer].length} to ${copySize}`);
      this.buffers[buffer] = Buffer.allocUnsafe(copySize);
    }
    src.copy(this.buffers[buffer], 0, 0, copySize);
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
}
