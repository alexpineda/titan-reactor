/* eslint-disable linebreak-style */
// thanks to farty and neiv for references
import BufferList from "bl";

import { AnimDds, GrpFrameType } from "../../types/grp";
import range from "../../utils/range";

const versionSD = 0x0101;
const versionHD = 0x0204;
const versionHD2 = 0x0202;

export const parseAnim = (buf: Buffer) => {
  const bl = new BufferList(buf);

  const header = bl.shallowSlice(0, 12 + 10 * 32);
  const magic = header.slice(0, 4).toString();
  const version = header.readUInt16LE(4);
  const numLayers = header.readUInt16LE(8);
  const numEntries = header.readUInt16LE(10);
  header.consume(12);

  const layerNames = range(0, 10)
    .map((i) => header.slice(i * 32, i * 32 + 32).toString())
    .map((str, i) => {
      const res = str.substr(0, str.indexOf("\u0000"));
      if (!res) {
        return `layer_${i}`;
      }
      return res;
    });

  if (magic !== "ANIM") {
    throw new Error("not an anim file");
  }
  if (version !== versionSD && numEntries != 1) {
    throw new Error("hd must have only 1 entry");
  }

  let lastOffset = version == versionSD ? 0x14c + 999 * 4 : 0x14c;

  const parseSprite = () => {
    const data = bl.shallowSlice(lastOffset);
    const numFrames = data.readUInt16LE(0);
    // sprite reference
    if (numFrames === 0) {
      const refId = data.readInt16LE(2);
      data.consume(4);
      lastOffset = lastOffset + 4 + 8;
      return {
        refId,
      };
    }
    const w = data.readUInt16LE(4);
    const h = data.readUInt16LE(6);
    const framesOffset = data.readUInt32LE(8);
    data.consume(12);
    const maps = parseTextures(data);
    const frames = parseFrames(numFrames, framesOffset);
    lastOffset = framesOffset + numFrames * 16;
    return {
      w,
      h,
      maps,
      frames,
    };
  };

  const parseTextures = (texture: BufferList): {
    [key: string]: AnimDds;
  } =>
    range(0, numLayers).reduce((tex, i) => {
      const ddsOffset = texture.readUInt32LE(0);
      const size = texture.readUInt32LE(4);
      const width = texture.readUInt16LE(8);
      const height = texture.readUInt16LE(10);
      texture.consume(12);
      if (ddsOffset > 0) {
        // @ts-ignore
        tex[layerNames[i]] = {
          ddsOffset,
          size,
          width,
          height,
        };
      }
      return tex;
    }, {});

  const parseFrames = (numFrames: number, o: number) => {
    return range(0, numFrames).map((frame) => {
      const frames = buf.slice(o + frame * 16);// bl.shallowSlice(o + frame * 16);
      const x = frames.readUInt16LE(0);
      const y = frames.readUInt16LE(2);
      const xoff = frames.readInt16LE(4);
      const yoff = frames.readInt16LE(6);
      const w = frames.readUInt16LE(8);
      const h = frames.readUInt16LE(10);
      return {
        x,
        y,
        xoff,
        yoff,
        w,
        h,
      };
    });
  };

  return range(0, numEntries).map(() => parseSprite());

};