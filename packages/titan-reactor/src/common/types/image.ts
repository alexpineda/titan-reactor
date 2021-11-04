import { ImageInstance } from "../image";
import { SpriteInstance } from "../../renderer/game";


export type createTitanImage = (
    imageId: number,
    sprite: SpriteInstance
  ) => ImageInstance;