import { generateMap } from "../../2d-map-rendering/generators/generateMap";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";

export const mapPreviewCanvas = async (chk, canvas) => {
  const { data, width, height } = await generateMap(chk, {
    scale: 0.25 * 0.25,
  });

  return rgbToCanvas({
    data,
    width,
    height,
    defaultCanvas: canvas,
  });
};
