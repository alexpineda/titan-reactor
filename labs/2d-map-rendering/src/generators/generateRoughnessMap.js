import Chk from "bw-chk";
import { nearestNeighbour } from "../image/nearest";

const elevations = [0.6, 1, 1, 1, 1];
const detailsRatio = 0.9;

export const generateRoughnessMap = (
  bwDataPath,
  scmData,
  scale = 0.25 * 0.5
) => {
  const chk = new Chk(scmData);
  const width = chk.size[0] * 32;
  const height = chk.size[1] * 32;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  return chk
    .image(fileAccess, width, height, {
      mode: "displacement",
      startLocations: false,
      sprites: false,
      displacement: {
        elevations,
        detailsRatio,
        tint: [1, 1, 1],
      },
    })
    .then((data) => nearestNeighbour(data, width, height, scale));
};
