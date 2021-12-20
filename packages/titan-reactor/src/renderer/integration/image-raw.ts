import { ImageDAT } from "../../common/types";

export interface ImageRAW {
  index: number;
  id: number;
  flags: number;
  frameIndex: number;
  x: number;
  y: number;
  modifier: number;
  modifierData1: number;
  flipped: boolean;
  hidden: boolean;
  frozen: boolean;
  isShadow: boolean;
  dat: ImageDAT;
}
