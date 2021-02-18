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
    return 28;
  }

  constructor(bwDat) {
    super();
    this.bwDat = bwDat;
  }

  get default() {
    return this.id;
  }

  get index() {
    return this._readU32(0);
  }

  get id() {
    return this._read32(4);
  }

  get flags() {
    return this._read32(8);
  }

  get modifier() {
    return this._read32(12);
  }

  get frameIndex() {
    return this._read32(16);
  }

  get x() {
    return this._read32(20);
  }

  get y() {
    return this._read32(24);
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
}
