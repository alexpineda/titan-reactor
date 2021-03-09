import ContiguousContainer from "./ContiguousContainer";

export default class UpgradeBW extends ContiguousContainer {
  static get byteLength() {
    return 5;
  }

  get owner() {
    return this._readU8(0);
  }

  get id() {
    return this._readU8(1);
  }

  get level() {
    return this._readU8(2);
  }

  get remainingTime() {
    return this._readU16(3);
  }

  object() {
    return {
      owner: this.owner,
      id: this.id,
      level: this.level,
      remainingTime: this.remainingTime,
    };
  }
}
