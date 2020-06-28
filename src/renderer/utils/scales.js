export default {
  //bw scales
  buildTileToPixel: (t) => t * 32,
  pixelToBuildTile: (p) => Math.floor(p / 32),
  walkTileToPixel: (w) => w * 8,
  pixelToWalkTile: (p) => Math.floor(p / 8),

  frameToSecond: (f) => f / 23.81,
  secondToFrame: (f) => 23.81,

  //our custom scales
  unitToScale: (u) => u * 4,
};
