import { drawFunctions } from "../../common/bwdat/enums/drawFunctions";
import ContiguousContainer from "./ContiguousContainer";

const flags = Object.freeze({
  redraw: 1,
  flipped: 2,
  frozen: 4,
  directional: 8,
  iscript: 0x10,
  clickable: 0x20,
  hidden: 0x40,
  specialOffset: 0x80,
});

export const IMAGE_BYTE_LENGTH = 14;
// all images in a bw frame
export default class ImagesBW extends ContiguousContainer {
  protected override byteLength = IMAGE_BYTE_LENGTH;
  get index() {
    return this._read16(0);
  }

  get id() {
    return this._read16(2);
  }

  get flags() {
    return this._read32(4);
  }

  get frameIndex() {
    return this._read16(8);
  }

  get x() {
    return this._read16(10);
  }

  get y() {
    return this._read16(12);
  }

  get flipped() {
    return (this.flags & flags.flipped) != 0;
  }

  get hidden() {
    return (this.flags & flags.hidden) != 0;
  }

  get frozen() {
    return (this.flags & flags.frozen) != 0;
  }

  get isShadow() {
    return this.bwDat.images[this.id].drawFunction === drawFunctions.rleShadow;
  }

  get imageType() {
    return this.bwDat.images[this.id];
  }
}
