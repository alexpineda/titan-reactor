export type PxToGameUnit = {
  x: (v: number) => number;
  y: (v: number) => number;
  xy: (v: number, y: number) => [number, number];
};

export type GetTerrainY = (v: number, y: number) => number;
