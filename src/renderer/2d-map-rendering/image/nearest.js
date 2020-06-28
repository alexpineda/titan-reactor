// import { GPU } from "gpu.js";
// import { range } from "ramda";

export function nearestNeighbour(src, srcWidth, srcHeight, scale) {
  const start = Date.now();
  if (scale === 1) {
    return {
      data: src,
      width: srcWidth,
      height: srcHeight,
    };
  }

  const dstWidth = srcWidth * scale;
  const dstHeight = srcHeight * scale;
  const data = new Buffer(dstWidth * dstHeight * 3);

  for (var x = 0; x < dstWidth; x++) {
    for (var y = 0; y < dstHeight; y++) {
      var sourceInd =
        3 * (Math.floor(y / scale) * srcWidth + Math.floor(x / scale));
      var targetInd = 3 * (y * dstWidth + x);
      var sourceP = src.slice(sourceInd, sourceInd + 3); //this.get(x/wScale, y/hScale)
      data[targetInd] = sourceP[0];
      data[targetInd + 1] = sourceP[1];
      data[targetInd + 2] = sourceP[2];
    }
  }

  console.log("nearestNeighbour", Date.now() - start);
  return {
    data,
    width: dstWidth,
    height: dstHeight,
  };
}

const dev = { mode: "dev" };
const prod = {};

// export function gpuNearestNeighbour(src, srcWidth, srcHeight, scale) {
//   const start = Date.now();
//   if (scale === 1) {
//     return {
//       data: src,
//       width: srcWidth,
//       height: srcHeight,
//     };
//   }

//   const gpu = new GPU(dev);

//   const dstWidth = srcWidth * scale;
//   const dstHeight = srcHeight * scale;

//   const render = gpu.createKernel(
//     function (src, srcWidth, srcHeight, scale, dstWidth, dstHeight) {
//       const x = this.thread.x % dstWidth;
//       const px = this.thread.x % 3;
//       const y = Math.floor(this.thread.x / dstWidth);

//       var sourceInd =
//         3 * (Math.floor(y / scale) * srcWidth + Math.floor(x / scale));

//       return src[sourceInd + px];
//     },
//     { output: [dstWidth * dstHeight * 3] }
//   );

//   const data = render(src, srcWidth, srcHeight, scale, dstWidth, dstHeight);
//   console.log("nearestNeighbour", Date.now() - start);
//   return {
//     data,
//     width: dstWidth,
//     height: dstHeight,
//   };
// }
