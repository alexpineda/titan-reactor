import ContiguousContainer from "./ContiguousContainer";

export default class UpgradeBW extends ContiguousContainer {
  static get byteLength() {
    return 5;
  }

  get owner() {
    return this._readU8(0);
  }

  get typeId() {
    return this._readU8(1);
  }

  get level() {
    return this._readU8(2);
  }

  get remainingBuildTime() {
    return this._readU16(3);
  }

  object() {
    return {
      owner: this.owner,
      typeId: this.typeId,
      level: this.level,
      remainingBuildTime: this.remainingBuildTime,
    };
  }
}
