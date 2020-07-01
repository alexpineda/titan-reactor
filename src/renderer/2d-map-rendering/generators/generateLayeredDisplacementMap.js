import { blendNonZeroPixels, overlayImage } from "../image/blend";
import { blurImage } from "../image/blur";
import { elevationColorAtMega } from "../image/elevationColorAtMega";

export const generateLayeredDisplacementMap = ({
  chk,
  width,
  height,
  elevations,
  detailsElevations,
  detailsRatio,
  walkableLayerBlur,
  allLayersBlur,
  showLayers,
}) => {
  return chk
    .image(width, height, {
      startLocations: false,
      sprites: false,
      colorAtMega: elevationColorAtMega({
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
        .image(width, height, {
          startLocations: false,
          sprites: false,
          colorAtMega: elevationColorAtMega({
            elevations,
            detailsElevations,
            detailsRatio,
            skipWalkable: true,
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
      };
    });
};
