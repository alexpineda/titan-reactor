import { Pass } from "postprocessing";
import { Group } from "three";

export type CanvasDimensions = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export enum UnitTileScale {
  SD = 1,
  HD2 = 2,
  HD = 4
}

export interface SpriteType extends Group {
  userData: {
    typeId: number;
    // we use this to know whether to damp y height or set it immediately
    isNew: boolean;
  }
}

export type PostProcessingBundle = {
  passes: Pass[]
}

export enum ShadowLevel {
  Off,
  Low,
  Medium,
  High
}

export enum GameAspect {
  Fit = "Fit",
  Native = "Native",
  FourThree = "FourThree",
  SixteenNine = "SixteenNine",
};