import { rgbToCanvas } from "../../canvas";

export const minimapBitmap = async (
  data: Uint8Array,
  mapWidth: number,
  mapHeight: number
): Promise<ImageBitmap> => {
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
  if (!destCtx) {
    throw new Error("Could not get context");
  }
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
