import * as log from "../ipc/log";
import { BwDAT, AssetTextureResolution } from "../../common/types";
import Glb from "../../common/image/atlas/atlas-glb";
import Anim from "../../common/image/atlas/atlas-anim";
import { ImageHD2, ImageHD, Image3D } from ".";

// @todo include skipShadows: number[] to look up if we don't load shadows in case the parent glb is to be loaded
export const createImageFactory = (
  bwDat: BwDAT,
  atlases: Glb[] | Anim[],
  spriteTextureResolution: AssetTextureResolution,
) => {
  return (imageId: number) => {
    const atlas = atlases[imageId];
    if (!atlas) {
      throw new Error(`imageId ${imageId} not found`);
    }

    const imageDef = bwDat.images[imageId];


    if (spriteTextureResolution === AssetTextureResolution.SD) {
      throw new Error("not implemented");
    }

    if (atlas instanceof Glb && atlas.model) {
      log.verbose(`creating image3D ${atlas.imageIndex}`);
      // only if the model exists
      return new Image3D(
        atlas,
        imageDef
      );
    }

    if (spriteTextureResolution === AssetTextureResolution.HD2) {
      log.verbose(`creating imageHD2 ${atlas.imageIndex}`);
      return new ImageHD2(
        atlas,
        imageDef
      );
    } else {
      log.verbose(`creating imageHD ${atlas.imageIndex}`);
      return new ImageHD(
        atlas,
        imageDef
      );
    }

    // let titanImage;
    // if (
    //   atlas instanceof Atlas3D &&
    //   bwDat.images[imageId].drawFunction === drawFunctions.rleShadow
    // ) {
    //   return null;
    // } else if (atlas instanceof Atlas3D && atlas.model) {
    //   // only if the model exists
    //   titanImage = new Image3D(
    //     atlas,
    //     imageDef,
    //     sprite
    //   );
    // } else {
    //   titanImage = new ImageHD2(
    //     atlas,
    //     imageDef,
    //     sprite
    //   );
    // }

    // return titanImage as Image;
  };
};
export default createImageFactory;
