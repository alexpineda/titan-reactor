import SoundsBW from "./SoundsBW";
import SpritesBW from "./SpritesBW";
import ImagesBW from "./ImagesBW";
import TilesBW from "./TilesBW";
import UnitsBW from "./UnitsBW";
import CreepBW from "./CreepBW";

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

  static get Creep() {
    return 6;
  }

  static get Sounds() {
    return 7;
  }

  constructor() {
    this.mode = ReadState.FrameCount;
    this.currentFrame = 0;
  }

  ended() {
    return this.currentFrame === this.maxFrame;
  }

  process(buf, frame) {
    if (this.mode === ReadState.FrameCount) {
      if (buf.length < 4) {
        return false;
      }

      this.maxFrame = buf.readInt32LE(0);
      buf.consume(4);
      this.mode = ReadState.Frame;
    }

    if (this.mode === ReadState.Frame) {
      if (buf.length < 24) {
        return false;
      }

      frame.frame = buf.readInt32LE(0);
      this.currentFrame = frame.frame;
      frame.tilesCount = buf.readUInt32LE(4);
      frame.creepCount = frame.tilesCount;
      frame.unitCount = buf.readInt32LE(8);
      frame.spriteCount = buf.readInt32LE(12);
      frame.imageCount = buf.readInt32LE(16);
      frame.soundCount = buf.readInt32LE(20);

      this.pos = 24;

      this.mode = ReadState.Tile;
      return true;
    }

    if (this.mode === ReadState.Tile) {
      const size = frame.tilesCount * TilesBW.byteLength;
      if (buf.length < this.pos + size) {
        return false;
      }

      frame.setBuffer("tiles", buf, this.pos, size);
      this.pos += size;

      this.mode = ReadState.Creep;

      return true;
    }

    if (this.mode === ReadState.Creep) {
      const size = frame.creepCount * CreepBW.byteLength;
      if (buf.length < this.pos + size) {
        return false;
      }

      frame.setBuffer("creep", buf, this.pos, size);
      this.pos += size;

      this.mode = ReadState.Unit;

      return true;
    }

    if (this.mode === ReadState.Unit) {
      const size = frame.unitCount * UnitsBW.byteLength;
      if (buf.length < this.pos + size) {
        return false;
      }

      frame.setBuffer("units", buf, this.pos, size);
      this.pos += size;

      this.mode = ReadState.Sprite;

      return true;
    }

    if (this.mode === ReadState.Sprite) {
      const size = frame.spriteCount * SpritesBW.byteLength;
      if (buf.length < this.pos + size) {
        return false;
      }

      frame.setBuffer("sprites", buf, this.pos, size);
      this.pos += size;

      this.mode = ReadState.Images;

      return true;
    }

    if (this.mode === ReadState.Images) {
      const size = frame.imageCount * ImagesBW.byteLength;
      if (buf.length < this.pos + size) {
        return false;
      }

      frame.setBuffer("images", buf, this.pos, size);
      this.pos += size;

      this.mode = ReadState.Sounds;

      return true;
    }

    if (this.mode === ReadState.Sounds) {
      const size = frame.soundCount * SoundsBW.byteLength;
      if (buf.length < this.pos + size) {
        return false;
      }

      if (this.soundCount == 0) {
        this.mode = ReadState.Frame;
        return true;
      }

      frame.setBuffer("sounds", buf, this.pos, size);
      this.pos += size;

      this.mode = ReadState.Frame;

      return true;
    }

    return false;
  }
}
