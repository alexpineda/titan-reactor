import SoundsBW from "./SoundsBW";
import SpritesBW from "./SpritesBW";
import ImagesBW from "./ImagesBW";
import TilesBW from "./TilesBW";
import UnitsBW from "./UnitsBW";
import CreepBW from "./CreepBW";
import BuildingQueueCountBW from "./BuildingQueueCountBW";

export default class ReadState {
  static get FrameCount() {
    return 0;
  }

  static get Frame() {
    return 1;
  }

  static get Tile() {
    return 2;
  }

  static get Creep() {
    return 3;
  }

  static get Unit() {
    return 4;
  }

  static get BuildQueue() {
    return 5;
  }

  static get Sprite() {
    return 6;
  }

  static get Images() {
    return 7;
  }

  static get Sounds() {
    return 8;
  }

  constructor() {
    this.mode = ReadState.FrameCount;
    this.currentFrame = 0;
    this.pos = 0;
  }

  ended() {
    return this.currentFrame === this.maxFrame;
  }

  fixedSizeTypeReader(name, size, buf, frame, next) {
    if (buf.length < this.pos + size) {
      return false;
    }

    frame.setBuffer(name, buf, this.pos, size);
    this.pos += size;

    this.mode = next;

    return true;
  }

  initType(frame, name, count, type) {
    return {
      name,
      count,
    };
  }

  process(buf, frame) {
    //@todo remove this and read from .rep
    if (this.mode === ReadState.FrameCount) {
      if (buf.length < 4) {
        return false;
      }

      this.maxFrame = buf.readInt32LE(0);
      buf.consume(4);
      this.mode = ReadState.Frame;
    }

    if (this.mode === ReadState.Frame) {
      if (buf.length < 28 + 8 * 10) {
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
      frame.buildingQueueCount = buf.readInt32LE(24);
      frame.minerals.length = 0;
      frame.gas.length = 0;
      frame.supplyUsed.length = 0;
      frame.supplyAvailable.length = 0;
      frame.workerSupply.length = 0;

      for (let i = 0; i < 8; i++) {
        frame.minerals.push(buf.readUInt16LE(28 + i * 10));
        frame.gas.push(buf.readUInt16LE(28 + i * 10 + 2));
        frame.supplyUsed.push(buf.readUInt16LE(28 + i * 10 + 4));
        frame.supplyAvailable.push(buf.readUInt16LE(28 + i * 10 + 6));
        frame.workerSupply.push(buf.readUInt16LE(28 + i * 10 + 8));
      }

      this.pos = 28 + 8 * 10;

      this.mode = ReadState.Tile;
      return true;
    }

    if (this.mode === ReadState.Tile) {
      return this.fixedSizeTypeReader(
        "tiles",
        frame.tilesCount * TilesBW.byteLength,
        buf,
        frame,
        ReadState.Creep
      );
    }

    if (this.mode === ReadState.Creep) {
      return this.fixedSizeTypeReader(
        "creep",
        frame.creepCount * CreepBW.byteLength,
        buf,
        frame,
        ReadState.Unit
      );
    }

    if (this.mode === ReadState.Unit) {
      return this.fixedSizeTypeReader(
        "units",
        frame.unitCount * UnitsBW.byteLength,
        buf,
        frame,
        ReadState.BuildQueue
      );
    }

    if (this.mode === ReadState.BuildQueue) {
      return this.fixedSizeTypeReader(
        "buildingQueue",
        frame.buildingQueueCount * BuildingQueueCountBW.byteLength,
        buf,
        frame,
        ReadState.Sprite
      );
    }

    if (this.mode === ReadState.Sprite) {
      return this.fixedSizeTypeReader(
        "sprites",
        frame.spriteCount * SpritesBW.byteLength,
        buf,
        frame,
        ReadState.Images
      );
    }

    if (this.mode === ReadState.Images) {
      return this.fixedSizeTypeReader(
        "images",
        frame.imageCount * ImagesBW.byteLength,
        buf,
        frame,
        ReadState.Sounds
      );
    }

    if (this.mode === ReadState.Sounds) {
      return this.fixedSizeTypeReader(
        "sounds",
        frame.soundCount * SoundsBW.byteLength,
        buf,
        frame,
        ReadState.Frame
      );
    }

    return false;
  }
}
