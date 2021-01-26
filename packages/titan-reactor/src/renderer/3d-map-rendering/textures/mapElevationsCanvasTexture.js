import { chkImage } from "image/chkImage";
import { colorAtMega } from "image/colorAtMega";
import dimensions from "./dimensions";
import { imageToCanvasTexture } from "titan-reactor-shared/image/imageToCanvasTexture";

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
