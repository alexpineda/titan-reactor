
import { Color, Object3D } from "three";
import { IScriptRunner } from "../iscript/iscript-runner";
import { ImageDAT } from "./bwdat";
import { Sprite } from "../../renderer/core/sprite";


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
