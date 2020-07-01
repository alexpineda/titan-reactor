import { mapImage } from "../../2d-map-rendering/image/mapImage";
import { rgbToCanvas } from "../../2d-map-rendering/image/canvas";
import { CanvasTexture, sRGBEncoding } from "three";
import { elevationColorAtMega } from "../../2d-map-rendering/image/elevationColorAtMega";
import dimensions from "./dimensions";

export const roughnessCanvasTexture = async (chk) => {
  const scale = 0.5;
  const { width, height } = dimensions(chk, scale);

  const data = await mapImage(
    chk,
    width,
    height,
    elevationColorAtMega({
      elevations: [1, 1, 1, 1, 1, 1, 1],
      detailsRatio: [0.5, 0, 0, 0, 0, 0, 0],
      water: true,
      lava: false,
      twilight: false,
      skipDetails: false,
      onlyWalkable: false,
      ...process,
    })
  );

  const canvas = rgbToCanvas({ data, width, height });
  const texture = new CanvasTexture(canvas);
  texture.encoding = sRGBEncoding;
  return texture;
};
