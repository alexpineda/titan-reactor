import ContiguousContainer from "./ContiguousContainer";

const flags = Object.freeze({});

export default class SpritesBW extends ContiguousContainer {
  static get byteLength() {
    return 36;
  }

  get default() {
    return this.index;
  }

  get index() {
    return this._readU32(0);
  }

  get id() {
    return this._read32(4);
  }

  get owner() {
    return this._read32(8);
  }

  get elevation() {
    return this._read32(12);
  }

  get flags() {
    return this._read32(16);
  }

  get x() {
    return this._read32(20);
  }

  get y() {
    return this._read32(24);
  }

  get numImages() {
    return this._read32(28);
  }

  get mainImageIndex() {
    return this._read32(32);
  }

  get order() {
    return Math.floor(this._offset / this.constructor.byteLength);
  }

  get object() {
    return {
      index: this._readU32(0),
      id: this._read32(4),
      owner: this._read32(8),
      elevation: this._read32(12),
      flags: this._read32(16),
      x: this._read32(20),
      y: this._read32(24),
      numImages: this._read32(28),
      mainImageIndex: this._read32(32),
    };
  }
}
