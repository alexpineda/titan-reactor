import SpriteInstance from "../../renderer/game/sprite-instance";

import { createIScriptRunner, ImageDATType } from "../types";
import GrpHD from "./grp-hd";
import TitanImageHD from "./titan-image-hd";

export default class TitanImageSD2 extends TitanImageHD {
  constructor(
    atlas: GrpHD,
    createIScriptRunner: createIScriptRunner,
    imageDef: ImageDATType,
    sprite: SpriteInstance
  ) {
    super(atlas, createIScriptRunner, imageDef, sprite, 32);
  }
}
