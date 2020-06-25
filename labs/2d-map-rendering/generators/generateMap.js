import Chk from "bw-chk";
import { blur } from "../image/blur";

export const generateMap = ({
  bwDataPath,
  scmData,
  scale = 1,
  blurFactor = 0,
}) => {
  const chk = new Chk(scmData);
  const fileAccess = Chk.fsFileAccess(bwDataPath);

  const width = chk.size[0] * 32 * scale;
  const height = chk.size[1] * 32 * scale;

  return chk
    .image(fileAccess, width, height, {
      mode: "terrain",
      startLocations: false,
      sprites: false,
    })
    .then((data) => {
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
