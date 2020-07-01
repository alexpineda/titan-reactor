import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { mapImage } from "../../2d-map-rendering/image/mapImage";
import { colorAtMega } from "../../2d-map-rendering/image/colorAtMega";
import dimensions from "./dimensions";
import { CanvasTexture, sRGBEncoding } from "three";

export const mapCanvasTexture = async (chk) => {
  const { width, height } = dimensions(chk);

  const data = await mapImage(chk, width, height, colorAtMega());

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
