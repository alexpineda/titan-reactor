import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { generateMap } from "../../2d-map-rendering/generators/generateMap";
import { CanvasTexture, sRGBEncoding } from "three";

export const bgMapCanvasTexture = async (chk, process) => {
  const { data, width, height } = await generateMap(
    chk,
    { scale: 0.25 * 0.25 },
    process,
    { blur: 16 }
  );

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
