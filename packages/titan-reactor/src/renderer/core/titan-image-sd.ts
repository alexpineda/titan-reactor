import { Sprite } from "./sprite";

import { createIScriptRunner, ImageDAT } from "../../common/types";
import AtlasHD from "../../common/image/atlas/atlas-hd";
import TitanImageHD from "./titan-image-hd";

export default class TitanImageSD2 extends TitanImageHD {
  constructor(
    atlas: AtlasHD,
    createIScriptRunner: createIScriptRunner,
    imageDef: ImageDAT,
    sprite: Sprite
  ) {
    super(atlas, createIScriptRunner, imageDef, sprite, 32);
  }
}
