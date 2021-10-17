import {
  LinearFilter,
  ClampToEdgeWrapping,
  LuminanceFormat,
  DataTexture,
  sRGBEncoding,
  UnsignedByteType,
  CompressedTexture,
} from "three";
import { Grp } from "bw-chk-modified/grp";
import { DDSLoader } from "./DDSLoader";

/**
 * SD via Anim
 */
export default class GrpSD2 {
  constructor() {
    this.texture = null;
    this.frames = [];
    this.rez = "sd2";
  }

  async load({ readGrp, sdAnim: sprite }) {
    const grp = new Grp(await readGrp(), Buffer);
    const { w, h } = grp.maxDimensions();

    const getBuf = (map, offset = 0) =>
      sprite.buf.slice(map.ddsOffset + offset, map.ddsOffset + map.size);

    if (sprite.maps.diffuse) {
      const ddsBuf = getBuf(sprite.maps.diffuse);
      this.diffuse = this._loadDDS(ddsBuf);
    } else {
      throw new Error("diffuse map required");
    }

    if (sprite.maps.teamcolor) {
      const test = getBuf(sprite.maps.teamcolor);
      const ddsBuf = getBuf(sprite.maps.teamcolor, 4);

      this.teamcolor = new DataTexture(
        new Uint8Array(ddsBuf),
        sprite.maps.teamcolor.width,
        sprite.maps.teamcolor.height,
        LuminanceFormat,
        UnsignedByteType
      );
    }

    this.frames = sprite.frames;
    this.width = sprite.maps.diffuse.width;
    this.height = sprite.maps.diffuse.height;
    this.grpWidth = w;
    this.grpHeight = h;
    return this;
  }

  _loadDDS(buf, encoding = sRGBEncoding) {
    const ddsLoader = new DDSLoader();

    const texDatas = ddsLoader.parse(buf, true);

    //ported from https://github.com/mrdoob/three.js/blob/45b0103e4dd9904b341d05ed991113f2f9edcc70/src/loaders/CompressedTextureLoader.js
    if (texDatas.isCubemap) {
      throw new Error("cubemap dds not supported");
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

    //@todo encoding
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.wrapT = ClampToEdgeWrapping;
    texture.wrapS = ClampToEdgeWrapping;
    texture.encoding = encoding;
    texture.flipY = false;
    return texture;
  }

  dispose() {
    this.texture.dispose();
  }
}
