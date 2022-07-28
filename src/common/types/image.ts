import type SelectionBars from "@core/selection-bars";
import type SelectionCircle from "@core/selection-circle";
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

export type MinimapDimensions = {
  minimapWidth: number;
  minimapHeight: number;
}

export enum UnitTileScale {
  SD = 1,
  HD2 = 2,
  HD = 4
}

export interface SpriteType extends Group {
  userData: {
    selectionCircle: SelectionCircle;
    selectionBars: SelectionBars;
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
  effects: Effect[],
  passes: Pass[]
}

export type GameViewPortRenderOptions = {
  unitScale: number;
  fogOfWarOpacity: number;
  rotateSprites: boolean;
  postProcessing: PostProcessingBundleDTO;
}