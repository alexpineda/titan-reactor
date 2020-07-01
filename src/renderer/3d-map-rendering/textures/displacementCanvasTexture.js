import { generateLayeredDisplacementMap } from "../../2d-map-rendering/generators/generateLayeredDisplacementMap";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { CanvasTexture, sRGBEncoding } from "three";

export const displacementCanvasTexture = async (chk) => {
  const scale = 0.25;

  const { data, width, height } = await generateLayeredDisplacementMap({
    chk,
    width: chk.size[0] * 32 * scale,
    height: chk.size[1] * 32 * scale,
    elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
    detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
    detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
    walkableLayerBlur: 16,
    allLayersBlur: 8,
  });

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
