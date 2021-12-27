import { Sprite } from "./sprite";

import { ImageDAT } from "../../common/types";
import Anim from "../../common/image/atlas/atlas-anim";
import ImageHD from "./image-hd";

export default class ImageSD extends ImageHD {
  constructor(
    atlas: Anim,
    imageDef: ImageDAT,
    sprite: Sprite
  ) {
    super(atlas, imageDef, sprite, 32);
  }
}
