import { drawFunctions } from "titan-reactor-shared/types/drawFunctions";
import TitanImage3D from "titan-reactor-shared/image/TitanImage3D";
import TitanImageHD from "titan-reactor-shared/image/TitanImageHD";
import TitanImageSD from "titan-reactor-shared/image/TitanImageSD";

export default (bwDat, atlases, createIScriptRunner, onError = () => {}) => {
  return (imageId, sprite) => {
    const atlas = atlases[imageId];
    if (!atlas || typeof atlas === "boolean") {
      onError(`composite ${imageId} has no atlas, did you forget to load one?`);
      return null;
    }

    const imageDef = bwDat.images[imageId];

    let titanImage;
    if (atlas.model) {
      if (bwDat.images[imageId].drawFunction === drawFunctions.rleShadow) {
        return null;
      }

      titanImage = new TitanImage3D(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else if (atlas.diffuse) {
      titanImage = new TitanImageHD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    } else {
      titanImage = new TitanImageSD(
        atlas,
        createIScriptRunner,
        imageDef,
        sprite
      );
    }
    return titanImage;
  };
};
