import Chk from "bw-chk";
import { blendNonZeroPixels, overlayImage } from "../image/blend";
import { blurImage } from "../image/blur";
import { displacementColorAtMega } from "../image/displacement";

export const generateDisplacementMap = ({
  bwDataPath,
  scmData,
  scale,
  elevations,
  detailsElevations,
  detailsRatio,
  walkableLayerBlur,
  allLayersBlur,
  showLayers,
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
        showLayers,
      }),
    })
    .then((data) => {
      blendNonZeroPixels(data, width, height);
      blurImage(data, width, height, walkableLayerBlur);

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
      blurImage(base, width, height, allLayersBlur);

      return {
        data: base,
        width,
        height,
        chk,
      };
    });
};
