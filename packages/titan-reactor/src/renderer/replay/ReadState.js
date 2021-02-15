class ReadType {
  static get SpriteBWByteLength() {
    return 36;
  }

  static SpriteBW(buf) {
    return {
      index: buf.readUInt32LE(0),
      id: buf.readInt32LE(4),
      owner: buf.readInt32LE(8),
      elevation: buf.readInt32LE(12),
      flags: buf.readInt32LE(16),
      x: buf.readInt32LE(20),
      y: buf.readInt32LE(24),
      numImages: buf.readInt32LE(28),
      mainImageIndex: buf.readInt32LE(32),
      images: [],
    };
  }

  static get ImageBWByteLength() {
    return 28;
  }

  static ImageBW(buf) {
    return {
      index: buf.readUInt32LE(0),
      id: buf.readInt32LE(4),
      flags: buf.readInt32LE(8),
      modifier: buf.readInt32LE(12),
      frameIndex: buf.readInt32LE(16),
      x: buf.readInt32LE(20),
      y: buf.readInt32LE(24),
    };
  }

  static get UnitBWByteLength() {
    return 48;
  }

  static UnitBW(buf) {
    return {
      index: buf.readUInt32LE(0),
      id: buf.readInt32LE(4),
      owner: buf.readInt32LE(8),
      x: buf.readInt32LE(12),
      y: buf.readInt32LE(16),
      hp: buf.readInt32LE(20),
      energy: buf.readInt32LE(24),
      spriteIndex: buf.readInt32LE(28),
      statusFlags: buf.readInt32LE(32),
      direction: buf.readInt32LE(36),
      angle: buf.readDoubleLE(40),
    };
  }

  static get TileBWByteLength() {
    return 4;
  }

  static TileBW(buf) {
    return {
      visible: buf.readUInt8(0),
      explored: buf.readUInt8(1),
      flags: buf.readUInt16LE(2),
    };
  }
}

export default class ReadState {
  static get FrameCount() {
    return 0;
  }

  static get Frame() {
    return 1;
  }

  static get Sprite() {
    return 2;
  }

  static get Images() {
    return 3;
  }

  static get Unit() {
    return 4;
  }

  static get Tile() {
    return 5;
  }

  constructor() {
    this.mode = ReadState.FrameCount;
    this.frame = 0;
  }

  ended() {
    return this.frame === this.maxFrame;
  }

  process(buf) {
    if (this.mode === ReadState.FrameCount) {
      if (buf.length < 4) {
        return false;
      }

      this.maxFrame = buf.readInt32LE(0);
      buf.consume(4);
      this.mode = ReadState.Frame;
    }

    if (this.mode === ReadState.Frame) {
      if (buf.length < 16) {
        return false;
      }
      this.sprites = [];
      this.units = [];
      this.tiles = [];
      this.frame = buf.readInt32LE(0);
      this.numTiles = buf.readUInt32LE(4);
      this.numUnits = buf.readInt32LE(8);
      this.numSprites = buf.readInt32LE(12);
      buf.consume(16);
      this.mode = ReadState.Tile;
      return true;
    }

    if (this.mode === ReadState.Tile) {
      while (
        buf.length >= ReadType.TileBWByteLength &&
        this.tiles.length < this.numTiles
      ) {
        this.tiles.push(
          ReadType.TileBW(buf.shallowSlice(0, ReadType.TileBWByteLength))
        );
        buf.consume(ReadType.TileBWByteLength);
      }
      // buf.consume(this.tiles.length * ReadType.TileBWByteLength);
      if (this.tiles.length === this.numTiles) {
        this.mode = ReadState.Unit;
        return true;
      }
      return false;
    }

    if (this.mode === ReadState.Unit) {
      while (
        buf.length >= ReadType.UnitBWByteLength &&
        this.units.length < this.numUnits
      ) {
        this.units.push(
          ReadType.UnitBW(buf.shallowSlice(0, ReadType.UnitBWByteLength))
        );
        buf.consume(ReadType.UnitBWByteLength);
      }
      // buf.consume(this.units.length * ReadType.UnitBWByteLength);

      if (this.units.length === this.numUnits) {
        this.mode = ReadState.Sprite;
        return true;
      }
      return false;
    }

    if (this.mode === ReadState.Sprite) {
      if (buf.length < ReadType.SpriteBWByteLength) {
        return false;
      }

      if (this.sprites.length === this.numSprites) {
        this.mode = ReadState.Frame;
        return true;
      }

      this.sprite = ReadType.SpriteBW(
        buf.shallowSlice(0, ReadType.SpriteBWByteLength)
      );
      this.sprites.push(this.sprite);
      buf.consume(ReadType.SpriteBWByteLength);

      this.mode = ReadState.Images;
      return true;
    }

    if (this.mode === ReadState.Images) {
      if (buf.length < ReadType.ImageBWByteLength) {
        return false;
      }

      if (this.sprite.images.length === this.sprite.numImages) {
        this.mode = ReadState.Sprite;
        return true;
      }

      this.sprite.images.push(
        ReadType.ImageBW(buf.shallowSlice(0, ReadType.ImageBWByteLength))
      );
      buf.consume(ReadType.ImageBWByteLength);

      return true;
    }

    return false;
  }
}
