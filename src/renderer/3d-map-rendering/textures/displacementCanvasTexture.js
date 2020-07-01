import { CanvasTexture, sRGBEncoding } from "three";
import { mapImage } from "../../2d-map-rendering/image/mapImage";
import { elevationColorAtMega } from "../../2d-map-rendering/image/elevationColorAtMega";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import dimensions from "./dimensions";

import { blurImage } from "../../2d-map-rendering/image/blur";
import {
  overlayImage,
  blendNonZeroPixels as blendPixels,
} from "../../2d-map-rendering/image/blend";

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
    post: {
      blur: 2,
      blendNonZeroPixels: false,
    },
  },
  overlayOptions = {
    colorAtMega: elevationColorAtMega({
      elevations: [0, 0.4, 0.79, 0.85, 1, 1, 0.85],
      detailsElevations: [1, 1, 0.5, 1, 0.5, 1, 0],
      detailsRatio: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
      skipWalkable: true,
    }),
    pre: {
      scale: 0.25,
    },
    post: { blur: 2 },
  }
) => {
  const { width, height } = dimensions(chk, baseOptions.pre.scale);

  const base = await mapImage(chk, width, height, baseOptions.colorAtMega);

  if (baseOptions.post.blendNonZeroPixels) {
    blendPixels(base, width, height);
  }
  if (baseOptions.post.blur) {
    blurImage(base, width, height, baseOptions.post.blur);
  }

  const overlay = await mapImage(
    chk,
    width,
    height,
    overlayOptions.colorAtMega
  );

  overlayImage(base, overlay);

  if (overlayOptions.post.blur) {
    blurImage(base, width, height, overlayOptions.post.blur);
  }

  const canvas = rgbToCanvas({ data: base, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
