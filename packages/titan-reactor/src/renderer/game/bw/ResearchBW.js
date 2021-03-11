import ContiguousContainer from "./ContiguousContainer";

export default class ResearchBW extends ContiguousContainer {
  static get byteLength() {
    return 4;
  }

  get owner() {
    return this._readU8(0);
  }

  get typeId() {
    return this._readU8(1);
  }

  get remainingBuildTime() {
    return this._readU16(2);
  }

  object() {
    return {
      owner: this.owner,
      typeId: this.typeId,
      remainingBuildTime: this.remainingBuildTime,
    };
  }
}
