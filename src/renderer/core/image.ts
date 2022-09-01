import { AnimAtlas, UnitTileScale, ImageDAT } from "common/types";
import type { Color, Object3D } from "three";

export interface ImageBaseMethods {
  setModifiers: (modifier: number, modifierData1: number, modifierData2: number) => void;
  setTeamColor: (color: Color) => void;
  setEmissive?(val: number): void;
  updateImageType(atlas: AnimAtlas, force?: boolean): void;
  setFrame: (frame: number, flip: boolean) => void;
}
export interface ImageBase extends Object3D, ImageBaseMethods {
  isImage3d: boolean;
  isInstanced?: boolean;
  dat: ImageDAT;
  _zOff: number;
  frame: number;

  // for iscript sprite
  readonly unitTileScale: UnitTileScale;
};