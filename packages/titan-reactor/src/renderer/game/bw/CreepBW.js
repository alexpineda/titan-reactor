import ContiguousContainer from "./ContiguousContainer";

export default class CreepBW extends ContiguousContainer {
  static get byteLength() {
    return 1;
  }

  get hasCreep() {
    return this._readU8(0);
  }

  hasCreepAt(i) {
    return this._buf.get(i);
  }
}
