import { invertObj } from "ramda";
//bw scales
export const pxToMapMeter = (mapWidth, mapHeight) => ({
  x: (x) => x / 32 - mapWidth / 2,
  y: (y) => y / 32 - mapHeight / 2,
});

export const gameSpeeds = {
  slowest: 167, // ms/frame
  slower: 111,
  slow: 83,
  normal: 67,
  fast: 56,
  faster: 48,
  fastest: 42,
  "1.5x": 31,
  "2x": 21,
  "4x": 10,
  "8x": 5,
  "16x": 2,
};
export const gameSpeedNames = invertObj(gameSpeeds);

export const framesPerSecond = (speed) => 1000 / speed;

export const angleToDirection = (angle) =>
  Math.floor(
    (((angle + (Math.PI * 1) / 2) % (Math.PI * 2)) / (Math.PI * 2)) * 32
  );
