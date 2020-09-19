import { chkImage } from "../../2d-map-rendering/image/chkImage";
import { colorAtMega } from "../../2d-map-rendering/image/colorAtMega";
import dimensions from "./dimensions";
import { imageToCanvasTexture } from "./imageToCanvasTexture";

export const mapElevationsCanvasTexture = async (chk) => {
  const scale = 0.25 * 0.5;
  const { width, height } = dimensions(chk, scale);
  const data = await chkImage(
    chk,
    width,
    height,
    colorAtMega({ renderElevations: true })
  );

  // await savePNG(data, width, height, "elevation." + Math.random());
  return imageToCanvasTexture(data, width, height);
};
