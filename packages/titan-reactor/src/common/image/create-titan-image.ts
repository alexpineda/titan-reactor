import { SpriteInstance } from "../../renderer/game";
import { drawFunctions } from "../bwdat/enums";
import { BwDAT, createIScriptRunner } from "../types";
import Atlas3D from "./atlas/atlas-3d";
import AtlasHD from "./atlas/atlas-hd";
import AtlasSD from "./atlas/atlas-sd";
import { ImageInstance } from "./image-instance";
import TitanImage3D from "./titan-image-3d";
import TitanImageHD from "./titan-image-hd";
import TitanImageSD from "./titan-image-sd2";

export const createTitanImageFactory = (
  bwDat: BwDAT,
  atlases: Atlas3D[] | AtlasHD[] | AtlasSD[],
  createIScriptRunner: createIScriptRunner,
  onError: (msg: string) => void
): ImageInstance | null => {
  return (imageId: number, sprite: SpriteInstance): ImageInstance | null => {
    const atlas = atlases[imageId];
    if (!atlas || typeof atlas === "boolean") {
      onError(`composite ${imageId} has no atlas, did you forget to load one?`);
      return null;
    }

    const imageDef = bwDat.images[imageId];

    let titanImage;
    if (atlas instanceof AtlasSD) {
      titanImage = new TitanImageSD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else if (
      // @todo make a smarter image factory that knows if the mainImage is a Grp3D or GrpHD
      // don't load shadow images for 3d
      atlas instanceof Atlas3D &&
      bwDat.images[imageId].drawFunction === drawFunctions.rleShadow
    ) {
      return null;
    } else if (atlas instanceof Atlas3D && atlas.model) {
      // only if the model exists
      titanImage = new TitanImage3D(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else {
      titanImage = new TitanImageHD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    }

    return titanImage;
  };
};
export default createTitanImageFactory;
