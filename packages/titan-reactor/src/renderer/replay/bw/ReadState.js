import ReadType from "./ReadType";
import SpritesBW from "./SpritesBW";
import ImagesBW from "./ImagesBW";

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

      this.sprites = Buffer.allocUnsafe(this.numSprites * SpritesBW.byteLength);

      this.images = Buffer.allocUnsafe(this.numImages * ImagesBW.byteLength);

      this.units = Buffer.allocUnsafe(
        this.numUnits * ReadType.UnitBWByteLength
      );

      this.tiles = Buffer.allocUnsafe(
        this.numTiles * ReadType.TileBWByteLength
      );

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
      if (buf.length < this.sprites.byteLength) {
        return false;
      }

      buf.copy(this.sprites, 0, 0, this.sprites.byteLength);
      buf.consume(this.sprites.byteLength);

      this.mode = ReadState.Images;

      return true;
    }

    if (this.mode === ReadState.Images) {
      if (buf.length < this.images.byteLength) {
        return false;
      }

      buf.copy(this.images, 0, 0, this.images.byteLength);
      buf.consume(this.images.byteLength);

      this.mode = ReadState.Frame;

      return true;
    }

    return false;
  }
}
