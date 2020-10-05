import { chkImage } from "image/chkImage";
import { colorAtMega } from "image/colorAtMega";
import dimensions from "./dimensions";

export const mapImage = async (chk) => {
  const { width, height } = dimensions(chk);
  const data = await chkImage(chk, width, height, colorAtMega());
  return { data, width, height };
};
