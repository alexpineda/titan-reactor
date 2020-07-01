import { generateElevationBasedMap } from "../../2d-map-rendering/generators/generateElevationBaseMap";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { CanvasTexture, sRGBEncoding } from "three";

export const roughnessCanvasTexture = async (chk, preset = {}) => {
  const { data, width, height } = await generateElevationBasedMap({
    chk,
    elevations: [1, 1, 1, 1, 1, 1, 1],
    detailsRatio: [0.5, 0, 0, 0, 0, 0, 0],
    scale: 0.5,
    blur: 0,
    water: true,
    lava: false,
    twilight: false,
    skipDetails: false,
    onlyWalkable: false,
    ...preset,
  });

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
