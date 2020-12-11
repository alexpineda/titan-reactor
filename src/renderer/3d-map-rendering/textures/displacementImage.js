import { chkImage } from "image/chkImage";
import { elevationColorAtMega } from "image/elevationColorAtMega";
import dimensions from "./dimensions";

import { blurImage, blurImageSelective } from "image/blur";
import { overlayImage, blendNonZeroPixels as blendPixels } from "image/blend";

export const displacementImage = async (
  chk,
  userBaseOptions = {},
  userOverlayOptions = {}
) => {
  const baseOptions = {
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
    ...userBaseOptions,
  };

  const overlayOptions = {
    colorAtMega: elevationColorAtMega({
      elevations: [0, 0.3, 0.69, 0.69, 1, 1, 0.85],
      detailsRatio: [0.15, 0.15, 0.1, 0.15, 0.1, 0.15, 0.15],
      skipWalkable: true,
    }),
    pre: {
      scale: 0.5,
    },
    post: { blur: 4 },
    ...userOverlayOptions,
  };

  const { width, height } = dimensions(chk, baseOptions.pre.scale);

  const base = await chkImage(chk, width, height, baseOptions.colorAtMega);
  // await savePNG(base, width, height, "walkable." + Math.random());
  // if (baseOptions.post.blendNonZeroPixels) {
  //   blendPixels(base, width, height);
  // }
  if (baseOptions.post.blur) {
    blurImageSelective(base, width, height, baseOptions.post.blur, [0, 0, 0]);
  }

  const overlay = await chkImage(
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

  return { data: base, width, height };
};
