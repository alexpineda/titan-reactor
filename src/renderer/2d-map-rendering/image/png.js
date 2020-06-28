import { PNG } from "pngjs";
import fs from "fs";

export const savePNG = (data, width, height, name, format = "rgb") => {
  const image = new PNG({
    width,
    height,
    colorType: format === "rgb" ? 2 : 6,
    inputColorType: format === "rgb" ? 2 : 6,
  });
  image.data = data;
  image.pack().pipe(fs.createWriteStream(`${name}.png`));
};
