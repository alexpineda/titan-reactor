import { Sprite } from "./sprite";

import { ImageDAT } from "../../common/types";
import Anim from "../../common/image/atlas/atlas-anim";
import ImageHD from "./image-hd";

export class ImageHD2 extends ImageHD {
    constructor(
        atlas: Anim,
        imageDef: ImageDAT,
    ) {
        super(atlas, imageDef, 64);
    }
}
