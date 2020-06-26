import Chk from "bw-chk";
import { nearestNeighbour } from "../image/nearest";
import { elevationColorAtMega } from "../image/elevationColorAtMega";

export const generateElevationBasedMap = ({
  bwDataPath,
  scmData,
  elevations,
  detailsRatio,
  scale = 1,
  water = false,
  twilight = false,
  lava = false,
  blur = 0,
  skipDetails = false,
  onlyWalkable = false,
}) => {
  const chk = new Chk(scmData);
  const width = chk.size[0] * 32 * scale;
  const height = chk.size[1] * 32 * scale;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  return chk
    .image(fileAccess, width, height, {
      startLocations: false,
      sprites: false,
      colorAtMega: elevationColorAtMega({
        elevations,
        detailsRatio,
        blur: blur,
        water,
        twilight,
        lava,
        skipDetails,
        onlyWalkable,
      }),
    })
    .then((data) => ({ chk, data, width, height }));
};
