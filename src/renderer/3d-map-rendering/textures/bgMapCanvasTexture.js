import { CanvasTexture, sRGBEncoding } from "three";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { mapImage } from "../../2d-map-rendering/image/mapImage";
import { colorAtMega } from "../../2d-map-rendering/image/colorAtMega";
import dimensions from "./dimensions";

export const bgMapCanvasTexture = async (chk) => {
  const scale = 0.25 * 0.25;
  const blur = 16;
  const { width, height } = dimensions(chk, scale);

  const data = await mapImage(chk, width, height, colorAtMega(), blur);

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
