import ContiguousContainer from "./ContiguousContainer";

export default class UnitsBW extends ContiguousContainer {
  static get byteLength() {
    return 48;
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

  get x() {
    return this._read32(12);
  }

  get y() {
    return this._read32(16);
  }

  get hp() {
    return this._read32(20);
  }

  get energy() {
    return this._read32(24);
  }

  get spriteIndex() {
    return this._read32(28);
  }

  get statusFlags() {
    return this._read32(32);
  }

  get direction() {
    return this._read32(36);
  }

  get angle() {
    return this._readDouble(40);
  }
}
