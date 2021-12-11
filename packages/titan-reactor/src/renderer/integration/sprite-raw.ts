import { SpriteDATType } from "../../common/types";

export interface SpriteRAW {
  index: number;
  id: number;
  owner: number;
  elevation: number;
  flags: number;
  x: number;
  y: number;
  imageCount: number;
  mainImageIndex: number;
  order: number;
  tileX: number;
  tileY: number;
  spriteType: SpriteDATType;
}
