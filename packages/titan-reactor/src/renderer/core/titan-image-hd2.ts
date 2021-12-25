import { Sprite } from "./sprite";

import { createIScriptRunner, ImageDAT } from "../../common/types";
import AtlasHD from "../../common/image/atlas/atlas-hd";
import TitanImageHD from "./titan-image-hd";

export class TitanImageHD2 extends TitanImageHD {
    constructor(
        atlas: AtlasHD,
        imageDef: ImageDAT,
        sprite: Sprite
    ) {
        super(atlas, imageDef, sprite, 64);
    }
}
