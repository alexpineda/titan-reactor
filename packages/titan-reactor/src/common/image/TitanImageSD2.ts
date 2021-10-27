import SpriteInstance from "src/renderer/game/SpriteInstance";

import { createIScriptRunner, ImageDATType } from "../types";
import GrpHD from "./GrpHD";
import TitanImageHD from "./TitanImageHD";

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
