import { chkImage } from "../../2d-map-rendering/image/chkImage";
import { elevationColorAtMega } from "../../2d-map-rendering/image/elevationColorAtMega";
import dimensions from "./dimensions";

export const roughnessImage = async (chk) => {
  const scale = 0.5;
  const { width, height } = dimensions(chk, scale);

  const data = await chkImage(
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

  return { data, width, height };
};
