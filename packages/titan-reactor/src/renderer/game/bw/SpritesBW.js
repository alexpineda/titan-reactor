import ContiguousContainer from "./ContiguousContainer";

const flags = Object.freeze({});

// all sprites in a bw frame
export default class SpritesBW extends ContiguousContainer {
  static get byteLength() {
    return 17;
  }

  get default() {
    return this.index;
  }

  get index() {
    return this._read16(0);
  }

  get id() {
    return this._read16(2);
  }

  get owner() {
    return this._read8(4);
  }

  get elevation() {
    return this._read8(5);
  }

  get flags() {
    return this._read32(6);
  }

  get x() {
    return this._read16(10);
  }

  get y() {
    return this._read16(12);
  }

  get imageCount() {
    return this._read8(14);
  }

  get mainImageIndex() {
    return this._read16(15);
  }

  get order() {
    return this.offset;
  }

  get tileX() {
    return Math.floor(this.x / 32);
  }

  get tileY() {
    return Math.floor(this.y / 32);
  }

  get spriteType() {
    return this.bwDat.sprites[this.id];
  }
}
