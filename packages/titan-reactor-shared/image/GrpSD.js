import {
  NearestFilter,
  LinearFilter,
  ClampToEdgeWrapping,
  RepeatWrapping,
  DataTexture,
  sRGBEncoding,
} from "three";
import { drawFunctions } from "titan-reactor-shared/types/drawFunctions";
import { Grp } from "bw-chk-modified/grp";

export default class GrpSD {
  constructor() {
    this.texture = null;
    this.frames = [];
    this.rez = "SD";
  }

  async load({ readGrp, imageDef, palettes }) {
    const grp = new Grp(await readGrp(), Buffer);

    const getPalette = () => {
      if (imageDef.drawFunction === drawFunctions.useRemapping) {
        return palettes[imageDef.remapping < 5 ? imageDef.remapping : 0];
      } else if (imageDef.drawFunction === drawFunctions.rleShadow) {
        return palettes.dark;
      }
      return palettes[0];
    };

    const { w: mw, h: mh } = grp.maxDimensions();

    this.canvases = [];

    const grpStride = Math.min(grp.frameCount(), 20);
    const cw = mw * grpStride;
    const ch = Math.ceil(grp.frameCount() / grpStride) * mh;
    const texData = new Uint8Array(cw * ch * 4);

    for (let i = 0; i < grp.frameCount(); i++) {
      const { data, x, y, w, h } = grp.decode(
        i,
        getPalette(),
        imageDef.drawFunction === drawFunctions.useRemapping,
        imageDef.drawFunction === drawFunctions.rleShadow
      );
      const grpX = (i % grpStride) * mw;
      const grpY = Math.floor(i / grpStride) * mh;

      this.frames.push({ x, y, grpX, grpY, w, h });

      for (let fy = 0; fy < h; fy++) {
        for (let fx = 0; fx < w; fx++) {
          const py = fy + y + grpY;
          const px = fx + x + grpX;
          const pos = (py * cw + px) * 4;
          const spritePos = (fy * w + fx) * 4;
          texData[pos] = data[spritePos];
          texData[pos + 1] = data[spritePos + 1];
          texData[pos + 2] = data[spritePos + 2];
          texData[pos + 3] = data[spritePos + 3];
        }
      }
    }

    this.grpWidth = mw;
    this.grpHeight = mh;
    this.width = cw;
    this.height = ch;

    this.texture = new DataTexture(texData, cw, ch);
    this.texture.flipY = true;
    this.texture.minFilter = LinearFilter;
    this.texture.magFilter = LinearFilter;
    this.texture.wrapT = ClampToEdgeWrapping;
    this.texture.wrapS = RepeatWrapping;
    this.texture.encoding = sRGBEncoding;

    return this.texture;
  }

  dispose() {
    this.texture.dispose();
  }
}
