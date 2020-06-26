import { blurImage } from "../image/blur";
import { colorAtMega } from "../image/colorAtMega";

export const generateMap = async ({
  chk,
  scale = 1,
  blur = 0,
  renderElevations = false,
}) => {
  const width = chk.size[0] * 32 * scale;
  const height = chk.size[1] * 32 * scale;

  const image = await chk.image(width, height, {
    mode: "terrain",
    startLocations: false,
    sprites: false,
    colorAtMega: colorAtMega({ renderElevations }),
  });

  blurImage(image, width, height, blur);

  return {
    data: image,
    width,
    height,
  };
};
