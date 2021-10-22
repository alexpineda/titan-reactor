import { rgbToCanvas } from "../../canvas";

export const minimapBitmap = async (data, mapWidth, mapHeight) => {
  const src = rgbToCanvas(
    {
      data,
      width: mapWidth * 32,
      height: mapHeight * 32,
    },
    "rgba"
  );

  const dst = document.createElement("canvas");
  dst.width = mapWidth * 2;
  dst.height = mapHeight * 2;
  const destCtx = dst.getContext("2d");
  destCtx.drawImage(src, 0, 0, dst.width, dst.height);

  const bitmap = await new Promise((res) => {
    createImageBitmap(destCtx.getImageData(0, 0, dst.width, dst.height)).then(
      (ib) => {
        res(ib);
      }
    );
  });

  return bitmap;
};
