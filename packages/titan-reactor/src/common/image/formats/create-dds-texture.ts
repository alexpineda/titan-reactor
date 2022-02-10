import * as log from "../../../renderer/ipc/log";
import {
  ClampToEdgeWrapping,
  CompressedTexture,
  LinearFilter,
  sRGBEncoding,
} from "three";

import parseDDS from "./parse-dds";

export const createDDSTexture = (
  buf: Buffer,
  encoding = sRGBEncoding
) => {
  const texDatas = parseDDS(buf, true);

  //ported from https://github.com/mrdoob/three.js/blob/45b0103e4dd9904b341d05ed991113f2f9edcc70/src/loaders/CompressedTextureLoader.js
  if (texDatas.isCubemap) {
    log.error("cubemap dds not supported");
  }

  const texture = new CompressedTexture(
    texDatas.mipmaps,
    texDatas.width,
    texDatas.height
  );

  if (texDatas.mipmapCount === 1) {
    texture.minFilter = LinearFilter;
  }

  texture.format = texDatas.format;
  texture.needsUpdate = true;

  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapT = ClampToEdgeWrapping;
  texture.wrapS = ClampToEdgeWrapping;
  texture.encoding = encoding;
  texture.flipY = false;
  return texture;
};
export default createDDSTexture;
