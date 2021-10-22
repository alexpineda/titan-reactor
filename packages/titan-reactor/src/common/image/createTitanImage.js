import { drawFunctions } from "../bw-types/drawFunctions";
import TitanImage3D from "./TitanImage3D";
import TitanImageHD from "./TitanImageHD";
import TitanImageSD from "./TitanImageSD";
import TitanImageSD2 from "./TitanImageSD2";
import GrpSD from "./GrpSD";
import GrpSD2 from "./GrpSD2";
import Grp3D from "./Grp3D";

export default (bwDat, atlases, createIScriptRunner, onError = () => {}) => {
  return (imageId, sprite) => {
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
    } else if (atlas instanceof GrpSD2) {
      titanImage = new TitanImageSD2(
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
