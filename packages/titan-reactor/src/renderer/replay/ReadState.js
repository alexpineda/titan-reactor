import ReadType from "./ReadType";

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

  static get Sounds() {
    return 6;
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
      if (buf.length < 20) {
        return false;
      }

      this.frame = buf.readInt32LE(0);
      this.numTiles = buf.readUInt32LE(4);
      this.numUnits = buf.readInt32LE(8);
      this.numSprites = buf.readInt32LE(12);
      this.numImages = buf.readInt32LE(16);

      this.sprites = [];
      this.units = Buffer.alloc(this.numUnits * ReadType.UnitBWByteLength);
      this.tiles = Buffer.alloc(this.numTiles * ReadType.TileBWByteLength);

      buf.consume(20);
      this.mode = ReadState.Tile;
      return true;
    }

    if (this.mode === ReadState.Tile) {
      if (buf.length < this.tiles.byteLength) {
        return false;
      }

      buf.copy(this.tiles, 0, 0, this.tiles.byteLength);
      buf.consume(this.tiles.byteLength);
      this.mode = ReadState.Unit;

      return true;
    }

    if (this.mode === ReadState.Unit) {
      if (buf.length < this.units.byteLength) {
        return false;
      }

      buf.copy(this.units, 0, 0, this.units.byteLength);
      buf.consume(this.units.byteLength);

      this.mode = ReadState.Sprite;

      return true;
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
