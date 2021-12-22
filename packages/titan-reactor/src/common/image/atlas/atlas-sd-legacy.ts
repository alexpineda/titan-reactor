import { Grp } from "../../image";
import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  sRGBEncoding,
} from "three";
import { ImageDAT } from "../../types";

import { drawFunctions } from "../../bwdat/enums/draw-functions";

type Palettes = Uint8Array[] & { dark?: Buffer; light?: Buffer };
/**
 * SD the old way
 */
// @todo refactor to implement GRPInterface
export class GrpSDLegacy {
  width = 0;
  height = 0;
  grpWidth? = 0;
  grpHeight? = 0;
  texture?: DataTexture;
  teamcolor?: DataTexture;
  frames?: {
    x: number;
    y: number;
    grpX: number;
    grpY: number;
    w: number;
    h: number;
  }[] = [];

  async load(
    {
      readGrp,
      imageDef,
      palettes,
    }: {
      readGrp: () => Promise<Buffer>;
      imageDef: ImageDAT;
      palettes: Palettes;
    },
    stride = 20
  ) {
    const grp = new Grp(await readGrp());

    const getPalette = () => {
      if (imageDef.drawFunction === drawFunctions.useRemapping) {
        return palettes[imageDef.remapping < 5 ? imageDef.remapping : 0];
      } else if (imageDef.drawFunction === drawFunctions.rleShadow && palettes.dark) {
        return new Uint8Array(palettes.dark);
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
      if (maskOut && playerMaskPalette) {
        maskData = grp.decode(
          i,
          playerMaskPalette,
          imageDef.drawFunction === drawFunctions.useRemapping,
          imageDef.drawFunction === drawFunctions.rleShadow
        ).data;
      }

      const grpX = (i % grpStride) * mw;
      const grpY = Math.floor(i / grpStride) * mh;

      if (!this.frames) {
        throw new Error("No frames");
      }
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

          if (maskOut && maskData) {
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
    return this;
  }

  dispose() {
    this.texture?.dispose();
  }
}
export default GrpSDLegacy;
