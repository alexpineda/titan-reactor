//bw scales
export const buildTileToPixel = (t) => t * 32;
export const pixelToBuildTile = (p) => Math.floor(p / 32);
export const walkTileToPixel = (w) => w * 8;
export const pixelToWalkTile = (p) => Math.floor(p / 8);

export const frameToSecond = (f, gameSpeed) => f / 23.81;
export const secondToFrame = (f, gameSpeed) => 23.81;
