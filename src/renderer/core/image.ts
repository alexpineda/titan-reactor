import { GRPInterface } from "../../common/types";
import type { Color, Object3D } from "three";
import type { ImageDAT } from "../../common/types/bwdat";
import { Unit } from "./unit";

export enum UnitTileScale {
  SD = 1,
  HD2 = 2,
  HD = 4
}

export interface Image extends Object3D {
  dat: ImageDAT;
  setFrame: (frame: number, flip: boolean) => void;

  _zOff: number;

  // for iscript sprite
  readonly unitTileScale: UnitTileScale;

  setModifiers: (modifier: number, modifierData1: number, modifierData2: number) => void;
  resetModifiers: () => void;
  setTeamColor: (color: Color) => void;

  changeImage(atlas: GRPInterface, imageDef: ImageDAT): void;

  userData: {
    unit?: Unit
  }
};
