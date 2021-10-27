import { SpriteInstance } from "../../renderer/game";
import { drawFunctions } from "../bwdat/enums";
import { BwDATType, createIScriptRunner } from "../types";
import Grp3D from "./Grp3D";
import GrpHD from "./GrpHD";
import GrpSD from "./GrpSD";
import { ImageInstance } from "./ImageInstance";
import TitanImage3D from "./TitanImage3D";
import TitanImageHD from "./TitanImageHD";
import TitanImageSD from "./TitanImageSD";

export type createTitanImage = (
  imageId: number,
  sprite: SpriteInstance
) => ImageInstance;

export const createTitanImageFactory = (
  bwDat: BwDATType,
  atlases: Grp3D[] | GrpHD[] | GrpSD[],
  createIScriptRunner: createIScriptRunner,
  onError: (msg: string) => void
) => {
  return (imageId: number, sprite: SpriteInstance) => {
    const atlas = atlases[imageId];
    if (!atlas || typeof atlas === "boolean") {
      onError(`composite ${imageId} has no atlas, did you forget to load one?`);
      return null;
    }

    const imageDef = bwDat.images[imageId];

    let titanImage;
    if (atlas instanceof GrpSD) {
      titanImage = new TitanImageSD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else if (
      //don't load shadow images for 3d
      atlas instanceof Grp3D &&
      bwDat.images[imageId].drawFunction === drawFunctions.rleShadow
    ) {
      return null;
    } else if (atlas instanceof Grp3D && atlas.model) {
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
