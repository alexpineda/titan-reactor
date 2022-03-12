export type PxToGameUnit = {
  x: (v: number) => number;
  y: (v: number) => number;
  xy: (xy: {
    x: number;
    y: number;
  }) => { x: number; y: number } | [number, number];
};

export type GetTerrainY = (v: number, y: number) => number;
