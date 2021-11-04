import { PxToGameUnit } from "../types/util";
import invertObj from "./invert-obj";

const transform = (a: number, b: number) => a / 32 - b / 2;

export const pxToMapMeter = (
  mapWidth: number,
  mapHeight: number
): PxToGameUnit => {
  return {
    x: (x: number) => transform(x, mapWidth),
    y: (y: number) => transform(y, mapHeight),
    xy: (xy: { x: number; y: number }) => {
      if (Array.isArray(xy)) {
        return [transform(xy[0], mapWidth), transform(xy[1], mapHeight)];
      } else {
        return {
          x: transform(xy.x, mapWidth),
          y: transform(xy.y, mapHeight),
        };
      }
    },
  };
};
export const gameSpeeds = {
  superSlow: 334, // ms/frame
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

export const framesBySeconds = (frames = 1, roundFn = Math.ceil) =>
  roundFn((frames * 1000) / gameSpeeds.fastest);

export const onFastestTick = (frame: number, seconds = 1) =>
  frame % (24 * seconds) === 0;

export const angleToDirection = (angle: number) =>
  Math.floor(
    (((angle + (Math.PI * 1) / 2) % (Math.PI * 2)) / (Math.PI * 2)) * 32
  );
