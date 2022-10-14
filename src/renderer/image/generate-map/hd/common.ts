import { ClampToEdgeWrapping, CompressedTexture, LinearFilter } from "three";

import parseDDS from "../../formats/parse-dds";

export const createCompressedDDSTexture = (buf: Buffer) => {
  const { mipmaps, width, height, format } = parseDDS(buf, false);

  const texture = new CompressedTexture(mipmaps, width, height, format);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapT = ClampToEdgeWrapping;
  texture.wrapS = ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
};