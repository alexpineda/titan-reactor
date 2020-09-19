import { chkImage } from "../../2d-map-rendering/image/chkImage";
import { colorAtMega } from "../../2d-map-rendering/image/colorAtMega";
import dimensions from "./dimensions";

export const mapImage = async (chk) => {
  const { width, height } = dimensions(chk);
  const data = await chkImage(chk, width, height, colorAtMega());
  return { data, width, height };
};
