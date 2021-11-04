import { ClampToEdgeWrapping, CompressedTexture, LinearFilter } from "three";

import { DDSLoader } from "../../formats/dds-loader";

const ddsLoader = new DDSLoader();

export const PX_PER_TILE = 128;

export const loadHdTile = (buf: Buffer) => {
  const {mipmaps, width, height, format} = ddsLoader.parse(buf, false);

  const hdTexture = new CompressedTexture(mipmaps, width, height, format);
  hdTexture.minFilter = LinearFilter;
  hdTexture.magFilter = LinearFilter;
  hdTexture.wrapT = ClampToEdgeWrapping;
  hdTexture.wrapS = ClampToEdgeWrapping;
  hdTexture.needsUpdate = true;

  return hdTexture;
};
