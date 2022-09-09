import { Vector2, Vector3 } from "three";

export type PxToGameUnit = {
  x: (v: number) => number;
  y: (v: number) => number;
  xy: (x: number, y: number, out?: Vector2) => Vector2;
  xyz: (x: number, y: number, out?: Vector3, zFunction?: (x: number, y: number) => number) => Vector3;
};

const transform = (a: number, b: number) => a / 32 - b / 2;

export const floor32 = (x: number) => Math.floor(x / 32);

export const pxToMapMeter = (
  mapWidth: number,
  mapHeight: number
): PxToGameUnit => {
  return {
    x: (x: number) => transform(x, mapWidth),
    y: (y: number) => transform(y, mapHeight),
    xy: (x: number, y: number, out?: Vector2) => {
      return (out ?? new Vector2).set(transform(x, mapWidth), transform(y, mapHeight));
    },
    xyz: (x: number, y: number, out?: Vector3, yFunction: (x: number, y: number) => number = () => 0) => {
      const nx = transform(x, mapWidth);
      const ny = transform(y, mapHeight);
      return (out ?? new Vector3).set(nx, yFunction(nx, ny), ny);
    }
  };
};

export enum gameSpeeds {
  superSlow = 334,
  slowest = 167,
  slower = 111,
  slow = 83,
  normal = 67,
  fast = 56,
  faster = 48,
  fastest = 42,
  "1.5x" = 31,
  "2x" = 21,
  "4x" = 10,
  "8x" = 5,
  "16x" = 2,
}

export const framesBySeconds = (frames = 1, roundFn = Math.ceil) =>
  roundFn((frames * 1000) / gameSpeeds.fastest);

export const onFastestTick = (frame: number, seconds = 1) =>
  frame % (24 * seconds) === 0;

export const angleToDirection = (angle: number) =>
  Math.floor(
    (((angle + (Math.PI * 1) / 2) % (Math.PI * 2)) / (Math.PI * 2)) * 32
  );

export const getSecond = (frame: number) => {
  return Math.floor((frame * gameSpeeds.fastest) / 1000);
}