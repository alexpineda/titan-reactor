export const rgbToCanvas = ({ data, width, height }) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  writeToContext2d(ctx, data, width, height);
  return canvas;
};

export function writeToContext2d(ctx, data, width, height) {
  const start = Date.now();
  const srcPixelWidth = "rgb".length;
  const dstPixelWidth = 4;

  const imagedata = ctx.createImageData(width, height);

  for (
    let src = 0, dst = 0;
    src < data.length;
    src += srcPixelWidth, dst += dstPixelWidth
  ) {
    imagedata.data[dst] = data[src];
    imagedata.data[dst + 1] = data[src + 1];
    imagedata.data[dst + 2] = data[src + 2];
    imagedata.data[dst + 3] = srcPixelWidth === 4 ? data[src + 3] : 255;
  }

  ctx.putImageData(imagedata, 0, 0);
  console.log("writeToCanvas", Date.now() - start);
}
