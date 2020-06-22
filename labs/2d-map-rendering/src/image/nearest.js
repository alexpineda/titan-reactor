export function nearestNeighbour(src, srcWidth, srcHeight, scale) {
  const dstWidth = srcWidth * scale;
  const dstHeight = srcHeight * scale;
  const data = new Buffer(dstWidth * dstHeight * 3);

  for (var x = 0; x < dstWidth; x++) {
    for (var y = 0; y < dstHeight; y++) {
      var sourceInd =
        4 * (Math.floor(y / scale) * srcWidth + Math.floor(x / scale));
      var targetInd = 3 * (y * dstWidth + x);
      var sourceP = src.slice(sourceInd, sourceInd + 3); //this.get(x/wScale, y/hScale)
      data[targetInd] = sourceP[0];
      data[targetInd + 1] = sourceP[1];
      data[targetInd + 2] = sourceP[2];
    }
  }

  return {
    data,
    width: dstWidth,
    height: dstHeight,
  };
}
