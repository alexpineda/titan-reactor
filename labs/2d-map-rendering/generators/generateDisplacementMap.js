import Chk from "bw-chk";
import { blendNonZeroPixels, overlayImage } from "../image/blend";
import { blur } from "../image/blur";
import { nearestNeighbour } from "../image/nearest";
import { displacement } from "../image/displacement";

export const generateDisplacementMap = ({
  bwDataPath,
  scmData,
  scale = 0.25,
  elevations = [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
  detailsElevations = [1, 1, 0.5, 1, 0.5, 1, 0],
  detailsRatio = [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
  walkableLayerBlur = 32,
  allLayersBlur = 8,
}) => {
  const chk = new Chk(scmData);
  const width = chk.size[0] * 32;
  const height = chk.size[1] * 32;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  let walkableLayer = null;

  return chk
    .image(fileAccess, width, height, {
      startLocations: false,
      sprites: false,
      render: displacement({
        elevations,
        detailsElevations,
        detailsRatio,
        skipDetails: true,
        onlyWalkable: true,
        tint: [1, 1, 1],
      }),
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
        startLocations: false,
        sprites: false,
        render: displacement({
          elevations,
          detailsElevations,
          detailsRatio,
          skipWalkable: true,
          tint: [1, 1, 1],
        }),
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
        chk,
      };
    });
};
