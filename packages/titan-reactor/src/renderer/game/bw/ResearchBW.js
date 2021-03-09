import ContiguousContainer from "./ContiguousContainer";

export default class ResearchBW extends ContiguousContainer {
  static get byteLength() {
    return 4;
  }

  get owner() {
    return this._readU8(0);
  }

  get id() {
    return this._readU8(1);
  }

  get remainingTime() {
    return this._readU16(2);
  }

  object() {
    return {
      owner: this.owner,
      id: this.id,
      remainingTime: this.remainingTime,
    };
  }
}
