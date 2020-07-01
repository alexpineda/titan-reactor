import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { generateMap } from "../../2d-map-rendering/generators/generateMap";
import { CanvasTexture, sRGBEncoding } from "three";

export const mapCanvasTexture = async (chk, preset = {}) => {
  const { data, width, height } = await generateMap({
    chk,
    scale: 1,
    blur: 0,
    ...preset,
  });

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
