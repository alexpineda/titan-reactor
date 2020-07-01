import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { generateMap } from "../../2d-map-rendering/generators/generateMap";
import { CanvasTexture, sRGBEncoding } from "three";

export const mapCanvasTexture = async (chk, process) => {
  const { data, width, height } = await generateMap(chk, { scale: 1 }, process);

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
