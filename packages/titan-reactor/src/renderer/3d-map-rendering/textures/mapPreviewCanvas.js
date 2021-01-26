import { chkImage } from "image/chkImage";
import { rgbToCanvas } from "titan-reactor-shared/image/canvas";
import { colorAtMega } from "image/colorAtMega";
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
