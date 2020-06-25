import Chk from "bw-chk";
import { blendNonZeroPixels, overlayImage } from "../image/blend";
import { blur } from "../image/blur";
import { displacementColorAtMega } from "../image/displacement";

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
  const originalWidth = chk.size[0] * 32;
  const originalHeight = chk.size[0] * 32;
  const width = originalWidth * scale;
  const height = originalHeight * scale;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  return chk
    .image(fileAccess, width, height, {
      startLocations: false,
      sprites: false,
      colorAtMega: displacementColorAtMega({
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
      blur(data, width, height, walkableLayerBlur);

      return chk
        .image(fileAccess, width, height, {
          startLocations: false,
          sprites: false,
          colorAtMega: displacementColorAtMega({
            elevations,
            detailsElevations,
            detailsRatio,
            skipWalkable: true,

            tint: [1, 1, 1],
          }),
        })
        .then((overlay) => [data, overlay]);
    })
    .then(([base, overlay]) => {
      overlayImage(base, overlay);
      blur(base, width, height, allLayersBlur);

      return {
        data: base,
        width,
        height,
        chk,
      };
    });
};
