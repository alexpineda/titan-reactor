import ContiguousContainer from "./ContiguousContainer";

// a block of creep data representing w x h map dimensions of creep information
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
