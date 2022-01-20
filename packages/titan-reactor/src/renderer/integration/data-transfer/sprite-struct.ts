import { ImageStruct } from ".";

export interface SpriteStruct {
  index: number;
  titanIndex: number;
  typeId: number;
  owner: number;
  elevation: number;
  flags: number;
  x: number;
  y: number;
  images: ImageStruct[];
  mainImageTitanIndex: number;
  order: number;
}
