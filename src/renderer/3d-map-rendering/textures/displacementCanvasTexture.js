import { CanvasTexture, sRGBEncoding } from "three";
import { mapImage } from "../../2d-map-rendering/image/mapImage";
import { elevationColorAtMega } from "../../2d-map-rendering/image/elevationColorAtMega";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import dimensions from "./dimensions";
import { savePNG } from "../../2d-map-rendering/image/png";

import {
  blurImage,
  blurImageSelective,
} from "../../2d-map-rendering/image/blur";
import {
  overlayImage,
  blendNonZeroPixels as blendPixels,
} from "../../2d-map-rendering/image/blend";

export const displacementCanvasTexture = async (
  chk,
  baseOptions = {
    colorAtMega: elevationColorAtMega({
      elevations: [0, 0.3, 0.69, 0.69, 1, 1, 0.85],
      detailsRatio: [0.15, 0.15, 0.1, 0.15, 0.1, 0.15, 0.15],
      skipDetails: true,
      onlyWalkable: true,
    }),
    pre: {
      scale: 0.5,
    },
    post: {
      blur: 16,
      blendNonZeroPixels: true,
    },
  },
  overlayOptions = {
    colorAtMega: elevationColorAtMega({
      elevations: [0, 0.3, 0.69, 0.69, 1, 1, 0.85],
      detailsRatio: [0.15, 0.15, 0.1, 0.15, 0.1, 0.15, 0.15],
      skipWalkable: true,
    }),
    pre: {
      scale: 0.5,
    },
    post: { blur: 4 },
  }
) => {
  const { width, height } = dimensions(chk, baseOptions.pre.scale);

  const base = await mapImage(chk, width, height, baseOptions.colorAtMega);
  // await savePNG(base, width, height, "walkable." + Math.random());
  // if (baseOptions.post.blendNonZeroPixels) {
  //   blendPixels(base, width, height);
  // }
  if (baseOptions.post.blur) {
    blurImageSelective(base, width, height, baseOptions.post.blur, [0, 0, 0]);
  }

  const overlay = await mapImage(
    chk,
    width,
    height,
    overlayOptions.colorAtMega
  );
  // await savePNG(overlay, width, height, "overlay." + Math.random());

  overlayImage(base, overlay);

  if (overlayOptions.post.blur) {
    blurImage(base, width, height, overlayOptions.post.blur);
  }

  const canvas = rgbToCanvas({ data: base, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
