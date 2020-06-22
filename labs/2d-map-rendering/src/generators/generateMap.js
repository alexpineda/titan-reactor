import Chk from "bw-chk";
// import { nearestNeighbour } from "../image/nearest";

export const generateMap = (bwDataPath, scmData, scale = 1, blur = 0) => {
  const chk = new Chk(scmData);
  const width = chk.size[0] * 32;
  const height = chk.size[1] * 32;
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  return chk
    .image(fileAccess, width, height, {
      mode: "terrain",
      startLocations: false,
      sprites: false,
      postProcess: {
        gaussianBlur: blur,
      },
    })
    .then((data) => {
      if (scale != 1) {
        return nearestNeighbour(data, width, height, scale);
      } else {
        return {
          data,
          width,
          height,
        };
      }
    });
};
