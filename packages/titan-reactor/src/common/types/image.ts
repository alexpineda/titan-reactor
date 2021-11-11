import { ImageInstance } from "../image";
import { SpriteInstance } from "../../renderer/game";

export type createTitanImage = (
  imageId: number,
  sprite: SpriteInstance
) => ImageInstance;

export type CanvasDimensions = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type GameCanvasDimensions = CanvasDimensions & {
  minimapSize: number;
};
