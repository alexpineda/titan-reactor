import { blurImage } from "./blur";
import { overlayImage, blendNonZeroPixels as blendPixels } from "./blend";
import { savePNG } from "./png";

export const mapImage = async (
  chk,
  width,
  height,
  colorAtMega,
  blur = 0,
  blendNonZeroPixels = false,
  mix
) => {
  console.log("chk image");
  const image = await chk.image(width, height, {
    startLocations: false,
    sprites: false,
    colorAtMega,
  });
  console.log("chk image end");

  if (blendNonZeroPixels) {
    blendPixels(image, width, height);
  }
  if (mix) {
    overlayImage(mix, image);
  }
  if (blur) {
    blurImage(image, width, height, blur);
  }

  return image;
};
