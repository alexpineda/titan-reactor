import { Color, Object3D } from "three";

import { IScriptRunner } from "../iscript/iscript-runner";
import { ImageDAT } from "../types/bwdat";

export type ImageInstance = Object3D & {
  imageDef: ImageDAT;
  iscript: IScriptRunner;
  setFrame: (frame: number, flip?: boolean) => void;

  _zOff: number;
  _spriteScale: number;
  setPosition: (x: number, y: number, scale?: number) => void;
  setPositionX: (x: number, scale?: number) => void;
  setPositionY: (y: number, scale?: number) => void;
  setWarpingIn: (warpingIn: number) => void;
  setCloaked: (cloaked: boolean) => void;
  setTeamColor: (color: Color) => void;
};
