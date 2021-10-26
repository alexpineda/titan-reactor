import SpriteGroup from "src/renderer/game/SpriteGroup";

import { ImageDATType } from "../types/bwdat";
import { createIScriptRunner } from "../types/iscript";
import GrpHD from "./GrpHD";
import TitanImageHD from "./TitanImageHD";

export default class TitanImageSD2 extends TitanImageHD {
  constructor(
    atlas: GrpHD,
    createIScriptRunner: createIScriptRunner,
    imageDef: ImageDATType,
    sprite: SpriteGroup
  ) {
    super(atlas, createIScriptRunner, imageDef, sprite, 32);
  }
}
