import { ImageBase } from "@core/image-base";
import { Group } from "three";

export enum UnitTileScale {
  SD = 1,
  HD2 = 2,
  HD = 4
}

export interface SpriteType extends Group {
  userData: {
    mainImage: ImageBase;
    typeId: number;
    // we use this to know whether to damp y height or set it immediately
    isNew: boolean;
  }
}

export enum GameAspect {
  Fit = "Fit",
  Native = "Native",
  FourThree = "FourThree",
  SixteenNine = "SixteenNine",
}