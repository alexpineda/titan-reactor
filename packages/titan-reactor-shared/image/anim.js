// thanks to farty and neiv for references
const { range } = require("ramda");
const BufferList = require("bl");

const versionSD = Symbol("sd");
const versionHD = Symbol("h");
const versionHD2 = Symbol("hd2");

const Version = {
  0x0101: versionSD,
  0x0202: versionHD,
  0x0204: versionHD2,
};

export const Anim = (buf) => {
  const bl = new BufferList(buf);

  const header = bl.shallowSlice(0, 12 + 10 * 32);
  const magic = header.slice(0, 4).toString();
  const version = Version[header.readUInt16LE(4)];
  const unk2 = header.readUInt16LE(6);
  const numLayers = header.readUInt16LE(8);
  const numEntries = header.readUInt16LE(10);
  header.consume(12);

  const layerNames = range(0, 10)
    .map((i) => header.slice(i * 32, i * 32 + 32).toString())
    .map((str, i) => {
      const res = str.substr(0, str.indexOf("\u0000"));
      if (!res) {
        return `layer_{i}`;
      }
      return res;
    });

  if (magic !== "ANIM") {
    throw new Error("not an anim file");
  }
  if (version === versionSD) {
    throw new Error("sd not supported");
  }
  if (version !== versionSD && numEntries != 1) {
    throw new Error("hd must have only 1 entry");
  }

  const parseSprite = (sprite) => {
    const numFrames = sprite.readUInt16LE(0);
    // sprite reference
    if (numFrames === 0) {
      const refId = sprite.readInt16LE(2);
      sprite.consume(4);
      return {
        refId,
      };
    }
    const w = sprite.readInt16LE(4);
    const h = sprite.readInt16LE(6);
    const framesOffset = sprite.readInt32LE(8);
    sprite.consume(12);
    const maps = parseTextures(sprite);
    const frames = parseFrames(numFrames, framesOffset);

    return {
      w,
      h,
      maps,
      frames,
    };
  };

  //    // In version 0x0101, the player color mask is in a bitmap format, which is just "BMP " followed by width*height bytes, either 0x00 or 0xFF in a top-to-bottom row order. version 0x0202 uses only DDS files.
  const parseTextures = (texture) =>
    range(0, numLayers).reduce((tex, i) => {
      const ddsOffset = texture.readUInt32LE(0);
      const size = texture.readUInt32LE(4);
      const width = texture.readUInt16LE(8);
      const height = texture.readUInt16LE(10);
      texture.consume(12);
      if (ddsOffset > 0) {
        tex[layerNames[i]] = {
          ddsOffset,
          size,
          width,
          height,
        };
      }
      return tex;
    }, {});

  const parseFrames = (numFrames, o) => {
    return range(0, numFrames).map((frame) => {
      const frames = bl.shallowSlice(o + frame * 16);
      const x = frames.readUInt16LE(0);
      const y = frames.readUInt16LE(2);
      const xoff = frames.readUInt16LE(4);
      const yoff = frames.readUInt16LE(6);
      const w = frames.readUInt16LE(8);
      const h = frames.readUInt16LE(10);
      const unk1 = frames.readUInt16LE(12);
      const unk2 = frames.readUInt16LE(14);

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

  const spriteOffsets = [];
  if (version !== versionSD) {
    spriteOffsets.push(0x14c);
  }

  const entries = bl.shallowSlice(spriteOffsets[0]);
  const sprite = parseSprite(entries);

  return {
    sprite,
    version,
  };
};
