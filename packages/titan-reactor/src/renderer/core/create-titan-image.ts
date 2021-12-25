import { drawFunctions } from "../../common/bwdat/enums";
import { BwDAT, createIScriptRunner } from "../../common/types";
import Atlas3D from "../../common/image/atlas/atlas-3d";
import AtlasHD from "../../common/image/atlas/atlas-hd";
import { Image, Sprite, TitanImageHD2, TitanImage3D } from ".";

export const createTitanImageFactory = (
  bwDat: BwDAT,
  atlases: Atlas3D[] | AtlasHD[],
  onError: (msg: string) => void = () => { }
) => {
  return (imageId: number, sprite: Sprite) => {
    const atlas = atlases[imageId];
    if (!atlas || typeof atlas === "boolean") {
      onError(`composite ${imageId} has no atlas, did you forget to load one?`);
      return null;
    }

    const imageDef = bwDat.images[imageId];


    let titanImage;
    if (
      atlas instanceof Atlas3D &&
      bwDat.images[imageId].drawFunction === drawFunctions.rleShadow
    ) {
      return null;
    } else if (atlas instanceof Atlas3D && atlas.model) {
      console.log(atlas.imageIndex, "is a 3d atlas");
      // only if the model exists
      titanImage = new TitanImage3D(
        atlas,
        imageDef,
        sprite
      );
    } else {
      titanImage = new TitanImageHD2(
        atlas,
        imageDef,
        sprite
      );
    }

    return titanImage as Image;
  };
};
export default createTitanImageFactory;
