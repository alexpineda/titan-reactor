import { BwDAT, AssetTextureResolution, GRPInterface } from "../../common/types";
import { ImageHD, Image3D, Image } from ".";
import { GlbAtlas } from "../../common/image";

export const createImageFactory = (
  bwDat: BwDAT,
  atlases: GRPInterface[],
  spriteTextureResolution: AssetTextureResolution,
) => {
  return (imageTypeId: number) => {
    const atlas = atlases[imageTypeId];
    if (!atlas) {
      throw new Error(`imageId ${imageTypeId} not found`);
    }

    const imageDef = bwDat.images[imageTypeId];

    if (spriteTextureResolution === AssetTextureResolution.SD) {
      throw new Error("not implemented");
    }

    let image;

    // if is shadow, check if prevous atlas is 3d,then don't load it!!

    if (atlas instanceof GlbAtlas && atlas.model) {
      image = new Image3D(
        atlas,
        imageDef
      );
    } else {

      image = new ImageHD(
        atlas,
        imageDef
      );
    }

    return image as Image;

  };
};
export default createImageFactory;
