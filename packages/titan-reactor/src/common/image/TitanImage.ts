import { Object3D } from "three";

import { IScriptRunner } from "../iscript/IScriptRunner";
import { ImageDATType } from "../types/bwdat";

export type TitanImage = Object3D & {
  imageDef: ImageDATType;
  iscript: IScriptRunner;
  setFrame: (frame: number, flip?: boolean) => void;

  _zOff: number;
  _spriteScale: number;
  setPosition: (x: number, y: number, scale?: number) => void;
  setPositionX: (x: number, scale?: number) => void;
  setPositionY: (y: number, scale?: number) => void;
};
