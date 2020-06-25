import Chk from "bw-chk";
import { nearestNeighbour } from "../image/nearest";
import { displacementColorAtMega } from "../image/displacement";

export const generateRoughnessMap = ({
  bwDataPath,
  scmData,
  elevations = [0.7, 1, 1, 1, 1, 1, 1],
  detailsElevations = [1, 0, 0, 0, 0, 0, 0],
  detailsRatio = [0.5, 0, 0, 0, 0, 0, 0],
  scale = 0.25 * 0.5,
  water = true,
  twilight = false,
  lava = false,
  blurFactor = 0,
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
      colorAtMega: displacementColorAtMega({
        elevations,
        detailsElevations,
        detailsRatio,
        tint: [1, 1, 1],
        blur: blurFactor,
        water,
        twilight,
        lava,
        skipDetails,
        onlyWalkable,
      }),
    })
    .then((data) => ({ chk, data, width, height }));
};
