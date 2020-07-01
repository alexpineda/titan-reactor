import { CanvasTexture, sRGBEncoding } from "three";
import { mapImage } from "../../2d-map-rendering/image/mapImage";
import { elevationColorAtMega } from "../../2d-map-rendering/image/elevationColorAtMega";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import dimensions from "./dimensions";

export const displacementCanvasTexture = async (
  chk,
  baseOptions = {
    colorAtMega: elevationColorAtMega({
      elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
      detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
      detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
      skipDetails: true,
      onlyWalkable: true,
    }),
    pre: {
      scale: 0.25,
    },
    post: {},
  },
  overlayOptions = {
    colorAtMega: elevationColorAtMega({
      elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
      detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
      detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
    }),
    pre: {
      scale: 0.25,
    },
    post: {},
  }
) => {
  const { width, height } = dimensions(chk, baseOptions.pre.scale);

  const base = await mapImage(
    chk,
    width,
    height,
    baseOptions.colorAtMega,
    baseOptions.post.blur,
    baseOptions.post.blendNonZeroPixels
  );

  await mapImage(
    chk,
    width,
    height,
    overlayOptions.colorAtMega,
    overlayOptions.post.blur,
    overlayOptions.post.blendNonZeroPixels,
    base
  );

  const canvas = rgbToCanvas({ data: base, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
