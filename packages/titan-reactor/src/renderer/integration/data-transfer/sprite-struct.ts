import { ImageStruct } from ".";

export interface SpriteStruct {
  index: number;
  owner: number;
  typeId: number;
  elevation: number;
  flags: number;
  x: number;
  y: number;
  mainImageIndex: number;
  imageCount: number;
  images: ImageStruct[];
}
