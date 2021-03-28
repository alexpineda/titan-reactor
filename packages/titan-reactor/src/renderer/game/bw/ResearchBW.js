import ContiguousContainer from "./ContiguousContainer";

export default class ResearchBW extends ContiguousContainer {
  static get byteLength() {
    return 6;
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

  get unitId() {
    return this._readU16(4);
  }

  get type() {
    return this.bwDat.tech[this.typeId];
  }

  object() {
    return {
      owner: this.owner,
      typeId: this.typeId,
      remainingBuildTime: this.remainingBuildTime,
      unitId: this.unitId,
      type: this.type,
    };
  }
}
