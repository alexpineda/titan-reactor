import { elevationColorAtMega } from "../image/elevationColorAtMega";

export const generateElevationBasedMap = ({
  chk,
  elevations,
  detailsRatio,
  scale = 1,
  water = false,
  twilight = false,
  lava = false,
  skipDetails = false,
  onlyWalkable = false,
}) => {
  const width = chk.size[0] * 32 * scale;
  const height = chk.size[1] * 32 * scale;

  return chk
    .image(width, height, {
      startLocations: false,
      sprites: false,
      colorAtMega: elevationColorAtMega({
        elevations,
        detailsRatio,
        water,
        twilight,
        lava,
        skipDetails,
        onlyWalkable,
      }),
    })
    .then((data) => ({ data, width, height }));
};
