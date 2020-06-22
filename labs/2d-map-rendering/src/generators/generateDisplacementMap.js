import Chk from "bw-chk";
import { blendNonZeroPixels, overlayImage } from "../image/blend";
import { blur } from "../image/blur";
import { nearestNeighbour } from "../image/nearest";

const elevations = [0, 0.4, 0.79, 0.85, 1];
const detailsRatio = 0.85;
const walkableLayerBlur = 32;
const allLayersBlur = 8;

export const generateDisplacementMap = (bwDataPath, scmData, scale = 0.25) => {
  const chk = new Chk(scmData);
  const width = chk.size[0] * 32;
  const height = chk.size[1] * 32;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  let walkableLayer = null;

  return chk
    .image(fileAccess, width, height, {
      mode: "displacement",
      startLocations: false,
      sprites: false,
      displacement: {
        elevations,
        detailsRatio,
        skipDetails: true,
        onlyWalkable: true,
        tint: [1, 1, 1],
      },
    })
    .then((data) => {
      blendNonZeroPixels(data, width, height);
      const { data: scaled, width: sw, height: sh } = nearestNeighbour(
        data,
        width,
        height,
        scale
      );
      blur(scaled, sw, sh, walkableLayerBlur);
      walkableLayer = scaled;

      return chk.image(fileAccess, width, height, {
        mode: "displacement",
        startLocations: false,
        sprites: false,
        displacement: {
          elevations,
          detailsRatio,
          skipWalkable: true,
          tint: [1, 1, 1],
        },
      });
    })
    .then((overlay) => {
      const { data: scaled, width: sw, height: sh } = nearestNeighbour(
        overlay,
        width,
        height,
        scale
      );
      
      overlayImage(walkableLayer, scaled);
      blur(walkableLayer, sw, sh, allLayersBlur);

      return {
        data: walkableLayer,
        width: sw,
        height: sh,
      };
    });
};
