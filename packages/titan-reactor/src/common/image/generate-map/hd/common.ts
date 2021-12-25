import { ClampToEdgeWrapping, CompressedTexture, LinearFilter } from "three";

import parseDDS from "../../formats/parse-dds";

export const PX_PER_TILE_HD = 128;

export const loadHdTile = (buf: Buffer) => {
  const { mipmaps, width, height, format } = parseDDS(buf, false);

  const hdTexture = new CompressedTexture(mipmaps, width, height, format);
  hdTexture.minFilter = LinearFilter;
  hdTexture.magFilter = LinearFilter;
  hdTexture.wrapT = ClampToEdgeWrapping;
  hdTexture.wrapS = ClampToEdgeWrapping;
  hdTexture.needsUpdate = true;

  return hdTexture;
};
