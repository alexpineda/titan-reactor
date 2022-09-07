import { Vector2, Vector3 } from "three";

export type PxToGameUnit = {
  x: (v: number) => number;
  y: (v: number) => number;
  xy: (x: number, y: number, out?: Vector2) => Vector2;
  xyz: (x: number, y: number, out?: Vector3, zFunction?: (x: number, y: number) => number) => Vector3;
};