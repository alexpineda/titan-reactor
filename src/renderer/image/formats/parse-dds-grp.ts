import { createCompressedTexture } from "@image/generate-map/hd/common";
import { DDSGrpFrameType } from "common/types";

export const parseDdsGrp = (buf: Buffer) => {
  const frameCount = buf.readUInt16LE(4);

  let pos = 8;

  const frames: Buffer[] = [];
  for (let i = 0; i < frameCount; i++) {
    const size = buf.readUInt32LE(pos + 8);
    const dds = buf.subarray(pos + 12, pos + 12 + size);

    pos = pos + 12 + size;
    frames.push(dds);
  }
  return frames;
};
export default parseDdsGrp;

export const parseDdsGrpWithFrameData = (buf: Buffer) => {
  const frameCount = buf.readUInt16LE(4);

  let pos = 8;

  const frames: DDSGrpFrameType[] = [];
  for (let i = 0; i < frameCount; i++) {
    const w = buf.readUInt16LE(pos + 4);
    const h = buf.readUInt16LE(pos + 6);
    const size = buf.readUInt32LE(pos + 8);
    const dds = buf.slice(pos + 12, pos + 12 + size);

    pos = pos + 12 + size;

    frames.push({ i, w, h, size, dds });
  }
  return frames;
};

export const parseDdsGrpAsTextures = (buf: Buffer) => {
  const textures = [];
  for (const dds of parseDdsGrp(buf)) {
    textures.push(createCompressedTexture(dds));
  }
  return textures;
}