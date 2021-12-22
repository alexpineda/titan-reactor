
import { Color, Object3D } from "three";
import { IScriptRunner } from "../iscript/iscript-runner";
import { ImageDAT } from "./bwdat";
import { Sprite } from "../../renderer/core/sprite";

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


export type createTitanImage = (
  imageId: number,
  sprite: Sprite
) => ImageInstance;

export type CanvasDimensions = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type GameCanvasDimensions = CanvasDimensions & {
  minimapSize: number;
};
