import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { CanvasTexture, sRGBEncoding } from "three";

export const imageToCanvasTexture = (data, width, height, format = "rgb") => {
  const canvas = rgbToCanvas({ data, width, height }, format);
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
