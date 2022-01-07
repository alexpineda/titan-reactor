// @ts-nocheck

import { SOUND_BYTE_LENGTH } from "../sounds";
import { STRUCT_SIZE } from "../sprites";
import { IMAGE_BYTE_LENGTH } from "../images";
import { TILE_BYTE_LENGTH } from "../tiles";
import { UNIT_BYTE_LENGTH } from "../units";
import { UPGRADE_BYTE_LENGTH } from "../upgrade";
import { RESEARCH_BYTE_LENGTH } from "../research";
import { BUILDING_BYTE_LENGTH } from "../building-queue-count";
import FrameBW from "../frame";
import BufferList from "bl";

export enum State {
  FrameCount,
  Frame,
  Tile,
  Creep,
  Unit,
  BuildQueue,
  Sprite,
  Images,
  Sounds,
  Research,
  Upgrades,
  FrameComplete,
}
// the main processing class for moving stream buffer data into FrameBW instances
export default class ReadState {
  mode = State.FrameCount; //@todo framecount doesnt make sense billy
  currentFrame = 0;
  pos = 0;
  maxFrame = -1;

  get isEndOfFile() {
    return this.currentFrame === this.maxFrame;
  }

  fixedSizeTypeReader(
    name: string,
    size: number,
    buf: BufferList,
    frame: FrameBW,
    next: State
  ) {
    if (buf.length < this.pos + size) {
      return false;
    }

    frame.setBuffer(name, buf, this.pos, size);
    this.pos += size;

    this.mode = next;

    return true;
  }

  process(buf: BufferList, frame: FrameBW) {
    //@todo remove this and read from .rep
    if (this.mode === State.FrameCount) {
      if (buf.length < 4) {
        return false;
      }

      this.maxFrame = buf.readInt32LE(0);
      buf.consume(4);
      this.mode = State.Frame;
    }

    if (this.mode === State.Frame) {
      const frameBaseSize = 36;

      if (buf.length < frameBaseSize + 8 * 10) {
        return false;
      }

      frame.frame = buf.readInt32LE(0);
      this.currentFrame = frame.frame;

      frame.tilesCount = buf.readUInt32LE(4);
      frame.creepCount = frame.tilesCount;
      frame.unitCount = buf.readInt32LE(8);
      frame.upgradeCount = buf.readInt32LE(12);
      frame.researchCount = buf.readInt32LE(16);
      frame.spriteCount = buf.readInt32LE(20);
      frame.imageCount = buf.readInt32LE(24);
      frame.soundCount = buf.readInt32LE(28);
      frame.buildingQueueCount = buf.readInt32LE(32);
      frame.minerals.length = 0;
      frame.gas.length = 0;
      frame.supplyUsed.length = 0;
      frame.supplyAvailable.length = 0;
      frame.workerSupply.length = 0;

      for (let i = 0; i < 8; i++) {
        frame.minerals.push(buf.readUInt16LE(frameBaseSize + i * 10));
        frame.gas.push(buf.readUInt16LE(frameBaseSize + i * 10 + 2));
        frame.supplyUsed.push(buf.readUInt16LE(frameBaseSize + i * 10 + 4));
        frame.supplyAvailable.push(
          buf.readUInt16LE(frameBaseSize + i * 10 + 6)
        );
        frame.workerSupply.push(buf.readUInt16LE(frameBaseSize + i * 10 + 8));
      }

      this.pos = frameBaseSize + 8 * 10;

      this.mode = State.Tile;
      return true;
    }

    if (this.mode === State.Tile) {
      return this.fixedSizeTypeReader(
        "tiles",
        frame.tilesCount * TILE_BYTE_LENGTH,
        buf,
        frame,
        State.Creep
      );
    }

    if (this.mode === State.Creep) {
      return this.fixedSizeTypeReader(
        "creep",
        frame.creepCount * CREEP_BYTE_LENGTH,
        buf,
        frame,
        State.Unit
      );
    }

    if (this.mode === State.Unit) {
      return this.fixedSizeTypeReader(
        "units",
        frame.unitCount * UNIT_BYTE_LENGTH,
        buf,
        frame,
        State.BuildQueue
      );
    }

    if (this.mode === State.BuildQueue) {
      return this.fixedSizeTypeReader(
        "buildingQueue",
        frame.buildingQueueCount * BUILDING_BYTE_LENGTH,
        buf,
        frame,
        State.Upgrades
      );
    }

    if (this.mode === State.Upgrades) {
      if (!frame.upgradeCount) {
        this.mode = State.Research;
        return true;
      }
      return this.fixedSizeTypeReader(
        "upgrades",
        frame.upgradeCount * UPGRADE_BYTE_LENGTH,
        buf,
        frame,
        State.Research
      );
    }

    if (this.mode === State.Research) {
      if (!frame.researchCount) {
        this.mode = State.Sprite;
        return true;
      }
      return this.fixedSizeTypeReader(
        "research",
        frame.researchCount * RESEARCH_BYTE_LENGTH,
        buf,
        frame,
        State.Sprite
      );
    }

    if (this.mode === State.Sprite) {
      return this.fixedSizeTypeReader(
        "sprites",
        frame.spriteCount * STRUCT_SIZE,
        buf,
        frame,
        State.Images
      );
    }

    if (this.mode === State.Images) {
      return this.fixedSizeTypeReader(
        "images",
        frame.imageCount * IMAGE_BYTE_LENGTH,
        buf,
        frame,
        State.Sounds
      );
    }

    if (this.mode === State.Sounds) {
      return this.fixedSizeTypeReader(
        "sounds",
        frame.soundCount * SOUND_BYTE_LENGTH,
        buf,
        frame,
        State.FrameComplete
      );
    }

    if (this.mode === State.FrameComplete) {
      this.mode = State.Frame;
      return true;
    }

    return false;
  }
}
