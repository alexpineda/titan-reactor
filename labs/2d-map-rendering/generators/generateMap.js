import Chk from "bw-chk";
import { blurImage } from "../image/blur";
import { colorAtMega } from "../image/colorAtMega";

export const generateMap = ({
  bwDataPath,
  scmData,
  scale = 1,
  blurFactor = 0,
  renderElevations = false,
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

      colorAtMega: colorAtMega({ renderElevations }),
    })
    .then((data) => {
      blurImage(data, width, height, blurFactor);

      return {
        data,
        width,
        height,
        chk,
      };
    });
};
