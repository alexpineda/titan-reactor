import ContiguousContainer from "./ContiguousContainer";

export const CREEP_BYTE_LENGTH = 1;
// a block of creep data representing w x h map dimensions of creep information
export class CreepBW extends ContiguousContainer {
  protected override byteLength = CREEP_BYTE_LENGTH;

  get hasCreep() {
    return this._readU8(0);
  }

  hasCreepAt(i: number) {
    return this._buf?.get(i);
  }
}
export default CreepBW;
