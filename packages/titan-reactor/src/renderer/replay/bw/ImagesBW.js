import { drawFunctions } from "titan-reactor-shared/types/drawFunctions";
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

export default class ImagesBW extends ContiguousContainer {
  static get byteLength() {
    return 16;
  }

  constructor(bwDat) {
    super();
    this.bwDat = bwDat;
  }

  get default() {
    return this.id;
  }

  get index() {
    return this._read16(0);
  }

  get id() {
    return this._read16(2);
  }

  get flags() {
    return this._read32(4);
  }

  get modifier() {
    return this._read16(8);
  }

  get frameIndex() {
    return this._read16(10);
  }

  get x() {
    return this._read16(12);
  }

  get y() {
    return this._read16(14);
  }

  get flipped() {
    return (this.flags & flags.flipped) != 0;
  }

  get hidden() {
    return (this.flags & flags.hidden) != 0;
  }

  get isShadow() {
    return this.bwDat.images[this.id].drawFunction === drawFunctions.rleShadow;
  }

  get imageType() {
    return this.bwDat.images[this.id];
  }
}
