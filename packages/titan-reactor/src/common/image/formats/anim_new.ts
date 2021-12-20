// thanks to farty and neiv for references
import { AnimDds, AnimSprite, AnimSpriteRef } from "../../types";
import range from "../../utils/range";

const versionSD = Symbol("sd");
const versionHD = Symbol("h");
const versionHD2 = Symbol("hd2");

const Version: Record<number, symbol> = {
  0x0101: versionSD,
  0x0202: versionHD2,
  0x0204: versionHD,
};

const parseLayerNames = (layers: Buffer) => {
  const layerNames = [];

  for (const i of range(0, 10)) {
    const str = layers.slice(i * 32, i * 32 + 32).toString();
    const res = str.substring(0, str.indexOf("\u0000"));
    layerNames[i] = res || `layer_${i}`;
  }

  return layerNames;
};

const parseSprite = (
  buf: Buffer,
  numLayers: number,
  layerNames: string[],
  lastOffset: number
) => {
  const data = buf.slice(lastOffset);
  const numFrames = data.readUInt16LE(0);
  // sprite reference
  if (numFrames === 0) {
    const refId = data.readInt16LE(2);
    return {
      sprite: { refId },
      lastOffset: lastOffset + 12,
    };
  }
  const w = data.readUInt16LE(4);
  const h = data.readUInt16LE(6);
  const framesOffset = data.readUInt32LE(8);

  const textures = data.slice(12);
  const maps = parseTextures(textures, numLayers, layerNames);
  const frames = parseFrames(buf, numFrames, framesOffset);
  return {
    sprite: {
      w,
      h,
      maps,
      frames,
    },
    lastOffset: framesOffset + numFrames * 16,
  };
};

const parseTextures = (
  texture: Buffer,
  numLayers: number,
  layerNames: string[]
) => {
  const tex: {
    [key: string]: AnimDds;
  } = {};

  for (const layer of range(0, numLayers)) {
    const ddsOffset = texture.readUInt32LE(layer * 12);
    if (ddsOffset === 0) {
      continue;
    }

    const size = texture.readUInt32LE(layer * 12 + 4);
    const width = texture.readUInt32LE(layer * 12 + 8);
    const height = texture.readUInt32LE(layer * 12 + 10);

    tex[layerNames[layer] as keyof typeof tex] = {
      ddsOffset,
      size,
      width,
      height,
    };
  }
  return tex;
};

const parseFrames = (buf: Buffer, numFrames: number, o: number) => {
  const result = [];
  for (const frame of range(0, numFrames)) {
    const frames = buf.slice(o + frame * 16);
    const x = frames.readUInt16LE(0);
    const y = frames.readUInt16LE(2);
    const xoff = frames.readInt16LE(4);
    const yoff = frames.readInt16LE(6);
    const w = frames.readUInt16LE(8);
    const h = frames.readUInt16LE(10);
    result[frame] = {
      x,
      y,
      xoff,
      yoff,
      w,
      h,
    };
  }

  return result;
};

export const parseAnim = (buf: Buffer) => {
  const header = buf.slice(0, 12 + 10 * 32);
  const magic = header.slice(0, 4).toString();
  const version = Version[header.readUInt16LE(4)];
  const numLayers = header.readUInt16LE(8);
  const numEntries = header.readUInt16LE(10);
  const layers = header.slice(12);

  const layerNames = parseLayerNames(layers);

  if (magic !== "ANIM") {
    throw new Error("not an anim file");
  }
  if (version !== versionSD && numEntries != 1) {
    throw new Error("hd must have only 1 entry");
  }

  let _lastOffset = version == versionSD ? 0x14c + 999 * 4 : 0x14c;

  const sprites: (AnimSprite | AnimSpriteRef)[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of range(0, numEntries)) {
    const { sprite, lastOffset } = parseSprite(
      buf,
      numLayers,
      layerNames,
      _lastOffset
    );
    _lastOffset = lastOffset;
    sprites.push(sprite);
  }

  return sprites;
};
export default parseAnim;
