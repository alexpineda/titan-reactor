import {
  LinearFilter,
  ClampToEdgeWrapping,
  LuminanceFormat,
  DataTexture,
  sRGBEncoding,
  UnsignedByteType,
  CompressedTexture,
} from "three";
import { drawFunctions } from "titan-reactor-shared/types/drawFunctions";
import { Grp } from "bw-chk-modified/grp";
import { Anim } from "./anim";
import { DDSLoader } from "./DDSLoader";

/**
 * Currently decoding the old way, maybe refactor to use anim?
 */
export default class GrpSD {
  constructor() {
    this.texture = null;
    this.frames = [];
    this.rez = "SD";
  }

  async load(
    { readGrp, imageDef, palettes, sdAnim: anim },
    stride = 20,
    useOldMethod = true
  ) {
    const grp = new Grp(await readGrp(), Buffer);

    if (!useOldMethod) {
      const getBuf = (map, offset = 0) =>
        buf.slice(map.ddsOffset + offset, map.ddsOffset + offset + map.size);

      if (anim.sprite.maps.diffuse) {
        const ddsBuf = getBuf(anim.sprite.maps.diffuse);
        this.diffuse = this._loadDDS(ddsBuf);
      } else {
        throw new Error("diffuse map required");
      }

      if (anim.sprite.maps.teamcolor) {
        const ddsBuf = getBuf(anim.sprite.maps.teamcolor, 4);
        const { w, h } = grp.maxDimensions();
        this.teamcolor = new DataTexture(
          ddsBuf,
          w,
          h,
          LuminanceFormat,
          UnsignedByteType
        );
      }

      this.frames = anim.sprite.frames;
      this.width = anim.sprite.maps.diffuse.width;
      this.height = anim.sprite.maps.diffuse.height;
      this.grpWidth = anim.sprite.w;
      this.grpHeight = anim.sprite.h;
      return;
    }

    const getPalette = () => {
      if (imageDef.drawFunction === drawFunctions.useRemapping) {
        return palettes[imageDef.remapping < 5 ? imageDef.remapping : 0];
      } else if (imageDef.drawFunction === drawFunctions.rleShadow) {
        return palettes.dark;
      }
      return palettes[0];
    };

    const palette = getPalette();

    let playerMaskPalette;
    if (palette === palettes[0]) {
      playerMaskPalette = Buffer.alloc(palette.byteLength);
      // using R value of the red player to determine mask alphas (tunit.pcx)
      // @todo use RGBAInteger format in shader and use tunit.pcx to apply nuances in colors or load from anim
      const playerColors = [244, 168, 168, 132, 96, 72, 52, 16];

      for (let i = 0; i < 8; i++) {
        playerMaskPalette[(i + 0x8) * 4 + 0] = playerColors[i];
        playerMaskPalette[(i + 0x8) * 4 + 1] = playerColors[i];
        playerMaskPalette[(i + 0x8) * 4 + 2] = playerColors[i];
      }
    }

    const { w: mw, h: mh } = grp.maxDimensions();

    const grpStride = Math.min(grp.frameCount(), stride);
    const cw = mw * grpStride;
    const ch = Math.ceil(grp.frameCount() / grpStride) * mh;
    const texOut = new Uint8Array(cw * ch * 4);

    let maskOut;
    if (playerMaskPalette) {
      maskOut = new Uint8Array(cw * ch * 4);
    }

    for (let i = 0; i < grp.frameCount(); i++) {
      const { data, x, y, w, h } = grp.decode(
        i,
        palette,
        imageDef.drawFunction === drawFunctions.useRemapping,
        imageDef.drawFunction === drawFunctions.rleShadow
      );

      let maskData;
      if (maskOut) {
        maskData = grp.decode(
          i,
          playerMaskPalette,
          imageDef.drawFunction === drawFunctions.useRemapping,
          imageDef.drawFunction === drawFunctions.rleShadow
        ).data;
      }

      const grpX = (i % grpStride) * mw;
      const grpY = Math.floor(i / grpStride) * mh;

      this.frames.push({ x, y, grpX, grpY, w, h });

      for (let fy = 0; fy < h; fy++) {
        for (let fx = 0; fx < w; fx++) {
          const py = fy + y + grpY;
          const px = fx + x + grpX;
          const pos = (py * cw + px) * 4;
          const spritePos = (fy * w + fx) * 4;
          texOut[pos] = data[spritePos];
          texOut[pos + 1] = data[spritePos + 1];
          texOut[pos + 2] = data[spritePos + 2];
          texOut[pos + 3] = data[spritePos + 3];

          if (maskOut) {
            maskOut[pos] = maskData[spritePos];
            maskOut[pos + 1] = maskData[spritePos + 1];
            maskOut[pos + 2] = maskData[spritePos + 2];
            maskOut[pos + 3] = maskData[spritePos + 3];
          }
        }
      }
    }

    this.grpWidth = mw;
    this.grpHeight = mh;
    this.width = cw;
    this.height = ch;

    this.texture = new DataTexture(texOut, cw, ch);
    this.texture.flipY = true;
    this.texture.minFilter = LinearFilter;
    this.texture.magFilter = LinearFilter;
    this.texture.wrapT = ClampToEdgeWrapping;
    this.texture.wrapS = ClampToEdgeWrapping;
    this.texture.encoding = sRGBEncoding;

    if (maskOut) {
      this.teamcolor = new DataTexture(maskOut, cw, ch);
      this.teamcolor.flipY = true;
      this.teamcolor.minFilter = LinearFilter;
      this.teamcolor.magFilter = LinearFilter;
      this.teamcolor.wrapT = ClampToEdgeWrapping;
      this.teamcolor.wrapS = ClampToEdgeWrapping;
    }
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
