import { chkImage } from "../../2d-map-rendering/image/chkImage";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { colorAtMega } from "../../2d-map-rendering/image/colorAtMega";
import dimensions from "./dimensions";

export const mapPreviewCanvas = async (chk, canvas) => {
  const scale = 0.25 * 0.25;
  const { width, height } = dimensions(chk, scale);
  const data = await chkImage(chk, width, height, colorAtMega());

  return rgbToCanvas({
    data,
    width,
    height,
    defaultCanvas: canvas,
  });
};
