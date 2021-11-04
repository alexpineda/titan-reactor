import ReadState, { State } from "../read-state";
import FrameBW from "../../../game/state/FrameBW";
import BufferList from "bl";
import { TILE_BYTE_LENGTH } from "../../../game/state/TilesBW";
import { CREEP_BYTE_LENGTH } from "../../../game/state/CreepBW";

// const bwUnitTags = Buffer.alloc(count * 2);
// for (let i = 0; i < count; i++) {
// bwUnitTags.writeUInt16LE(unitTags[i]);
const FRAME_HEADER_SIZE = 4 + 36 + 8 * 10;

describe("ReadState", () => {
  test("should not read frame count if not enough bytes", () => {
    const frameBw = new FrameBW();
    const readState = new ReadState();

    const buf = new BufferList(Buffer.alloc(1));
    const result = readState.process(buf, frameBw);

    expect(result).toBe(false);
  });

  test("should read frame count first", () => {
    const frameBw = new FrameBW();
    const readState = new ReadState();

    const buf = Buffer.alloc(4);
    buf.writeInt32LE(99);
    const bl = new BufferList(buf);
    const result = readState.process(bl, frameBw);

    expect(result).toBe(false);
    expect(bl.length).toBe(0);
    expect(readState.maxFrame).toBe(99);
    expect(readState.mode).toBe(State.Frame);
  });

  test("should start reading frames after frame count 1", () => {
    const frameBw = new FrameBW();
    const readState = new ReadState();

    const buf = Buffer.alloc(4 + 21);
    buf.writeInt32LE(99);
    const bl = new BufferList(buf);
    let result = readState.process(bl, frameBw);
    expect(readState.mode).toBe(State.Frame);

    result = readState.process(bl, frameBw);
    expect(result).toBe(false);
    expect(readState.mode).toBe(State.Frame);
  });

  test("should start reading frames after frame count 2", () => {
    const frameBw = new FrameBW();
    const readState = new ReadState();

    const buf = Buffer.alloc(FRAME_HEADER_SIZE);
    buf.writeInt32LE(99, 0);
    buf.writeInt32LE(1, 4);
    buf.writeUInt32LE(2, 8);
    buf.writeInt32LE(3, 12);
    buf.writeInt32LE(4, 16);
    buf.writeInt32LE(5, 20);
    buf.writeInt32LE(6, 24);
    buf.writeInt32LE(7, 28);
    buf.writeInt32LE(8, 32);
    buf.writeInt32LE(9, 36);

    const bl = new BufferList(buf);
    const result = readState.process(bl, frameBw);
    expect(result).toBe(true);
    expect(readState.mode).toBe(State.Tile);

    expect(frameBw.frame).toBe(1);
    expect(frameBw.tilesCount).toBe(2);
    expect(frameBw.unitCount).toBe(3);
    expect(frameBw.upgradeCount).toBe(4);
    expect(frameBw.researchCount).toBe(5);
    expect(frameBw.spriteCount).toBe(6);
    expect(frameBw.imageCount).toBe(7);
    expect(frameBw.soundCount).toBe(8);
    expect(frameBw.buildingQueueCount).toBe(9);
  });

  const writeRandomFrame = () => {
    const rand = () => Math.floor(Math.random() * 100);
    const frame = rand();
    const tilesCount = rand();
    const unitCount = rand();
    const spriteCount = rand();
    const imageCount = rand();
    const soundCount = rand();
    const upgradeCount = rand();
    const researchCount = rand();
    const buildingQueueCount = rand();

    const buf = Buffer.alloc(FRAME_HEADER_SIZE);
    buf.writeInt32LE(frame, 0);
    buf.writeUInt32LE(tilesCount, 4);
    buf.writeInt32LE(unitCount, 8);
    buf.writeInt32LE(upgradeCount, 12);
    buf.writeInt32LE(researchCount, 16);
    buf.writeInt32LE(spriteCount, 20);
    buf.writeInt32LE(imageCount, 24);
    buf.writeInt32LE(soundCount, 28);
    buf.writeInt32LE(buildingQueueCount, 32);
    return {
      buf,
      frame,
      tilesCount,
      unitCount,
      spriteCount,
      imageCount,
      soundCount,
      buildingQueueCount,
      upgradeCount,
      researchCount,
    };
  };

  test("fixed size type reader", () => {
    const frameBw = new FrameBW();
    const readState = new ReadState();
    const bl = new BufferList(Buffer.alloc(4));

    let result = readState.fixedSizeTypeReader("tiles", 24, bl, frameBw, 1);
    expect(result).toBe(false);

    bl.append(Buffer.alloc(21));

    result = readState.fixedSizeTypeReader("tiles", 24, bl, frameBw, 1);
    expect(result).toBe(true);
    expect(readState.pos).toBe(24);
  });

  test("full test", () => {
    const frameBw = new FrameBW();
    const readState = new ReadState();

    const bl = new BufferList(Buffer.alloc(4));
    let result = readState.process(bl, frameBw);

    expect(readState.mode).toBe(State.Frame);

    const {
      buf,
      frame,
      tilesCount,
      unitCount,
      spriteCount,
      imageCount,
      soundCount,
      upgradeCount,
      researchCount,
      buildingQueueCount,
    } = writeRandomFrame();

    bl.append(buf);
    result = readState.process(bl, frameBw);
    expect(result).toBe(true);
    expect(readState.mode).toBe(State.Tile);

    expect(frameBw.frame).toBe(frame);
    expect(frameBw.tilesCount).toBe(tilesCount);
    expect(frameBw.unitCount).toBe(unitCount);
    expect(frameBw.spriteCount).toBe(spriteCount);
    expect(frameBw.imageCount).toBe(imageCount);
    expect(frameBw.soundCount).toBe(soundCount);
    expect(frameBw.upgradeCount).toBe(upgradeCount);
    expect(frameBw.researchCount).toBe(researchCount);
    expect(frameBw.buildingQueueCount).toBe(buildingQueueCount);

    let size = TILE_BYTE_LENGTH * tilesCount;
    bl.append(Buffer.alloc(size));
    result = readState.process(bl, frameBw);
    expect(result).toBe(true);
    expect(frameBw.tiles.length).toBe(size);
    expect(readState.mode).toBe(State.Creep);

    size = CREEP_BYTE_LENGTH * frameBw.creepCount;
    bl.append(Buffer.alloc(size));
    result = readState.process(bl, frameBw);
    expect(result).toBe(true);
    expect(frameBw.creep.length).toBe(size);
    expect(readState.mode).toBe(State.Unit);
  });
});
