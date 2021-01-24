import { GrpAtlasHD } from "./GrpAtlasHD";
import loadGlb from "./loadGlb";

export default class GrpAtlas3D extends GrpAtlasHD {
  constructor(envMap) {
    super();
    this.envMap = envMap;
  }

  async load({ glbFileName, readAnim, imageDef }) {
    await super.load({ readAnim });

    try {
      const { model, animations } = await loadGlb(
        glbFileName,
        this.envMap,
        imageDef.name
      );
      this.model = model;
      this.animations = animations;

      const looseFrames = this.frames.length % 17;

      this.fixedFrames = this.frames.map((f, i) => {
        if (imageDef.gfxTurns) {
          if (i < this.frames.length - looseFrames) {
            return Math.floor(i / 17);
          } else {
            return Math.floor(i / 17) + (i % 17);
          }
        } else {
          return i;
        }
      });
    } catch (e) {}
    // const getPalette = () => {
    //   if (imageDef.drawFunction === drawFunctions.useRemapping) {
    //     return palettes[imageDef.remapping < 5 ? imageDef.remapping : 0];
    //   } else if (imageDef.drawFunction === drawFunctions.rleShadow) {
    //     return palettes.dark;
    //   }
    //   return palettes[0];
    // };
  }

  dispose() {
    super.dispose();
  }
}
