import { Effect, Pass } from "postprocessing";
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
    fixedY?: number;
    typeId: number;
    /**
     * for matrix calculations
     */
    needsMatrixUpdate: boolean;
    renderTestCount: number;
  }
}

export type PostProcessingBundleDTO = {
  fogOfWarEffect?: Effect;
  renderPass?: Pass;
  effects: Effect[],
  passes: Pass[]
}

export type SpriteRenderOptions = {
  unitScale: number;
  rotateSprites: boolean;
}

export enum AssetTextureResolution {
  SD = "sd",
  HD = "hd",
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