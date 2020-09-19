import { chkImage } from "../../2d-map-rendering/image/chkImage";
import { colorAtMega } from "../../2d-map-rendering/image/colorAtMega";
import dimensions from "./dimensions";
import { imageToCanvasTexture } from "./imageToCanvasTexture";

export const bgMapCanvasTexture = async (chk) => {
  const scale = 0.25 * 0.25;
  const blur = 16;
  const { width, height } = dimensions(chk, scale);

  const data = await chkImage(chk, width, height, colorAtMega(), blur);

  return imageToCanvasTexture(data, width, height);
};
