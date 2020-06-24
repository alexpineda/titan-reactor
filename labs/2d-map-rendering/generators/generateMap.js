import Chk from "bw-chk";
import { nearestNeighbour, gpuNearestNeighbour } from "../image/nearest";
import { blur } from "../image/blur";

export const generateMap = ({
  bwDataPath,
  scmData,
  scale = 1,
  blurFactor = 0,
}) => {
  const chk = new Chk(scmData);
  const width = chk.size[0] * 32;
  const height = chk.size[1] * 32;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  return chk
    .image(fileAccess, width, height, {
      mode: "terrain",
      startLocations: false,
      sprites: false,
    })
    .then((data) => {
      if (scale != 1) {
        return gpuNearestNeighbour(data, width, height, scale);
      }

      return {
        data,
        width,
        height,
      };
    })
    .then(({ data, width, height }) => {
      if (blurFactor > 0) {
        blur(data, width, height, blurFactor);
      }
      return {
        data,
        width,
        height,
        chk,
      };
    });
};

export const generateMapCanvas = ({
  bwDataPath,
  scmData,
  scale = 1,
  blurFactor = 0,
}) => {
  const chk = new Chk(scmData);
  const width = chk.size[0] * 32;
  const height = chk.size[1] * 32;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  return chk.image(fileAccess, width, height, {
    mode: "terrain",
    canvas: true,
    startLocations: false,
    sprites: false,
  });
};
