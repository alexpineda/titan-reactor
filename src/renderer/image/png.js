import { PNG } from "pngjs";
import fs from "fs";

export const loadPNG = (filepath) =>
  new Promise((res, rej) => {
    fs.createReadStream(filepath)
      .pipe(
        new PNG({
          filterType: 1,
        })
      )
      .on("parsed", function () {
        res({
          width: this.width,
          height: this.height,
          data: this.data,
        });
      })
      .on("error", rej);
  });

export const savePNG = (data, width, height, name, format = "rgb") =>
  new Promise((res, rej) => {
    const image = new PNG({
      width,
      height,
      colorType: format === "rgb" ? 2 : 6,
      inputColorType: format === "rgb" ? 2 : 6,
    });
    image.data = data;
    image
      .pack()
      .pipe(
        fs
          .createWriteStream(`${name}`)
          .on("close", res)
          .on("error", console.error)
      );
  });
