import { Color, Object3D } from "three";
import { ImageDAT } from "../../common/types/bwdat";
import { Sprite } from "../../renderer/core";

export enum UnitTileScale {
  SD = 1,
  HD2 = 2,
  HD = 4
}

export type Image = Object3D & {
  dat: ImageDAT;
  setFrame: (frame: number, flip?: boolean) => void;

  _zOff: number;

  // for iscript sprite
  readonly unitTileScale: UnitTileScale;

  // for mouse input
  sprite?: Sprite;

  // for useDepth
  offsetX: number;
  offsetY: number;

  setWarpingIn: (warpingIn: number) => void;
  setCloaked: (cloaked: boolean) => void;
  setTeamColor: (color: Color) => void;
};
