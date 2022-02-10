import { GRPInterface } from "../../common/types";
import type { Color, Object3D } from "three";
import type { ImageDAT } from "../../common/types/bwdat";

export enum UnitTileScale {
  SD = 1,
  HD2 = 2,
  HD = 4
}

export type Image = Object3D & {
  dat: ImageDAT;
  setFrame: (frame: number, flip: boolean) => void;

  _zOff: number;

  // for iscript sprite
  readonly unitTileScale: UnitTileScale;

  offsetX: number;
  offsetY: number;

  setWarpingIn: (warpingIn: number) => void;
  setCloaked: (cloaked: boolean) => void;
  setTeamColor: (color: Color) => void;

  changeImage(atlas: GRPInterface, imageDef: ImageDAT): void;
};
