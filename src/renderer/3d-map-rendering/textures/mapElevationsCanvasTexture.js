import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { generateMap } from "../../2d-map-rendering/generators/generateMap";
import { CanvasTexture, sRGBEncoding } from "three";

export const mapElevationsCanvasTexture = async (chk) => {
  const { data, width, height } = await generateMap(
    chk,
    { scale: 0.25 * 0.5 },
    { renderElevations: true }
  );

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
