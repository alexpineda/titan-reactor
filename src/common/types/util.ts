import { Vector2, Vector3 } from "three";

export type PxToGameUnit = {
  x: (v: number) => number;
  y: (v: number) => number;
  xy: (x: number, y: number, out: Vector2) => void;
  xyz: (x: number, y: number, zFunction: (x: number, y: number) => number, out: Vector3) => void;
};

export type GetTerrainY = (x: number, z: number) => number;
