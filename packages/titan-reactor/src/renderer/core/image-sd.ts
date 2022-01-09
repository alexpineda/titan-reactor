
import { ImageDAT } from "../../common/types";
import AnimSD from "../../common/image/atlas/atlas-anim-sd";
import ImageHD from "./image-hd";

export class ImageSD extends ImageHD {
  constructor(
    atlas: AnimSD,
    imageDef: ImageDAT,
  ) {
    super(atlas, imageDef);
  }
}
