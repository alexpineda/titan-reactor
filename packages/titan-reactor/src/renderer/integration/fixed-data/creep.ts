import ContiguousContainer from "./contiguous-container";

export const CREEP_BYTE_LENGTH = 1;
// a block of creep data representing w x h map dimensions of creep information
export class CreepBW extends ContiguousContainer {
  protected override byteLength = CREEP_BYTE_LENGTH;

  get hasCreep() {
    return this._readU8(0);
  }
}
export default CreepBW;
