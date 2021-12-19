import SpriteInstance from "../../renderer/game/sprite-instance";

import { createIScriptRunner, ImageDATType } from "../types";
import AtlasHD from "./atlas/atlas-hd";
import TitanImageHD from "./titan-image-hd";

export default class TitanImageSD2 extends TitanImageHD {
  constructor(
    atlas: AtlasHD,
    createIScriptRunner: createIScriptRunner,
    imageDef: ImageDATType,
    sprite: SpriteInstance
  ) {
    super(atlas, createIScriptRunner, imageDef, sprite, 32);
  }
}
