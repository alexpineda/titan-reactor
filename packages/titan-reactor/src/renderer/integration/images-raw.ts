import { ImageDATType } from "../../common/types";

export interface ImagesRAW {
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
  imageType: ImageDATType;
}
