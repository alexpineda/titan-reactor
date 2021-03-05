import {
  LinearFilter,
  ClampToEdgeWrapping,
  RepeatWrapping,
  CompressedTexture,
  sRGBEncoding,
} from "three";

import { Anim } from "titan-reactor-shared/image/anim";
import { DDSLoader } from "titan-reactor-shared/image/DDSLoader";

export default class GrpHD {
  constructor() {
    this.frames = [];
    this.rez = "hd";
  }

  async load({ readAnim, readAnimHD2 }) {
    const buf = await readAnim();
    const anim = Anim(buf);

    const buf2 = await readAnimHD2();
    const animHD2 = Anim(buf2);

    const getBuf = (map) => buf.slice(map.ddsOffset, map.ddsOffset + map.size);
    const getBuf2 = (map) =>
      buf2.slice(map.ddsOffset, map.ddsOffset + map.size);

    if (anim.sprite.maps.diffuse) {
      const ddsBuf = getBuf(anim.sprite.maps.diffuse);
      this.diffuse = this._loadDDS(ddsBuf);

      if (animHD2.sprite.maps.diffuse) {
        const ddsBuf = getBuf2(animHD2.sprite.maps.diffuse);
        this.diffuse.mipmaps.push(this._loadDDS(ddsBuf).mipmaps[0]);
      }
    } else {
      throw new Error("diffuse map required");
    }

    if (anim.sprite.maps.teamcolor) {
      const ddsBuf = getBuf(anim.sprite.maps.teamcolor);
      this.teamcolor = this._loadDDS(ddsBuf);

      if (animHD2.sprite.maps.teamcolor) {
        const ddsBuf = getBuf2(animHD2.sprite.maps.teamcolor);
        this.teamcolor.mipmaps.push(this._loadDDS(ddsBuf).mipmaps[0]);
      }
    }

    this.frames = anim.sprite.frames;
    this.width = anim.sprite.maps.diffuse.width;
    this.height = anim.sprite.maps.diffuse.height;
    this.grpWidth = anim.sprite.w;
    this.grpHeight = anim.sprite.h;

    // if (anim.sprite.maps.bright) {
    //   const ddsBuf = getBuf(anim.sprite.maps.bright);
    //   this.brightness = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.normal) {
    //   const ddsBuf = getBuf(anim.sprite.maps.normal);
    //   this.normal = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.specular) {
    //   const ddsBuf = getBuf(anim.sprite.maps.specular);
    //   this.specular = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.ao_depth) {
    //   const ddsBuf = getBuf(anim.sprite.maps.ao_depth);
    //   this.ao_depth = this._loadDDS(ddsBuf);
    // }
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
    texture.wrapS = RepeatWrapping;
    texture.encoding = encoding;
    texture.flipY = false;
    return texture;
  }

  dispose() {
    this.diffuse && this.diffuse.dispose();
    // this.texture = null;
    this.brightness && this.brightness.dispose();
    // this.brightness = null;
    this.teamcolor && this.teamcolor.dispose();
    // this.teamcolor = null;
    this.normal && this.normal.dispose();
    // this.normal = null;
    this.specular && this.specular.dispose();
    // this.specular = null;
    this.ao_depth && this.ao_depth.dispose();
    // this.ao_depth = null;
  }
}
