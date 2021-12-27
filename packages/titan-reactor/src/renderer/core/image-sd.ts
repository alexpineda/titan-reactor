
import { ImageDAT } from "../../common/types";
import Anim from "../../common/image/atlas/atlas-anim";
import ImageHD from "./image-hd";

export class ImageSD extends ImageHD {
  constructor(
    atlas: Anim,
    imageDef: ImageDAT,
  ) {
    super(atlas, imageDef, 32);
  }
}
