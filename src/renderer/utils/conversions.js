import { invertObj } from "ramda";
//bw scales
export const buildTileToPixel = (t) => t * 32;
export const pixelToBuildTile = (p) => Math.floor(p / 32);
export const walkTileToPixel = (w) => w * 8;
export const pixelToWalkTile = (p) => Math.floor(p / 8);
export const scaleTileToMeter = (t) => t / 32;

export const gameSpeeds = {
  slowest: 167, // ms/frame
  slower: 111,
  slow: 83,
  normal: 67,
  fast: 56,
  faster: 48,
  fastest: 42,
  "2x": 21,
  "4x": 10,
  "8x": 5,
  "16x": 2,
};
export const gameSpeedNames = invertObj(gameSpeeds);

export const frameToSecond = (f, gameSpeed) => f / 23.81;
export const secondToFrame = (f, gameSpeed) => 23.81;

export const angleToDirection = (angle) =>
  Math.floor(
    (((angle + (Math.PI * 1) / 2) % (Math.PI * 2)) / (Math.PI * 2)) * 32
  );

export const angleToDirectionUsingCamera = (camera) => (angle) =>
  Math.floor(
    (((angle + (Math.PI * 1) / 2) % (Math.PI * 2)) / (Math.PI * 2)) * 32
  );
