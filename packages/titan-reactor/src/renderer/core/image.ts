import { Color, Object3D } from "three";

import { ImageDAT } from "../../common/types/bwdat";

export type Image = Object3D & {
  imageDef: ImageDAT;
  setFrame: (frame: number, flip?: boolean) => void;

  _zOff: number;
  readonly imageScale: number;
  setPosition: (x: number, y: number, scale?: number) => void;
  setPositionX: (x: number, scale?: number) => void;
  setPositionY: (y: number, scale?: number) => void;
  setWarpingIn: (warpingIn: number) => void;
  setCloaked: (cloaked: boolean) => void;
  setTeamColor: (color: Color) => void;
};
