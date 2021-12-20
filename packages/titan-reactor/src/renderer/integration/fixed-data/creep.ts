import { CreepRAW } from "../creep-raw";
import ContiguousContainer from "./contiguous-container";

export const CREEP_BYTE_LENGTH = 1;
// a block of creep data representing w x h map dimensions of creep information
export class CreepBW extends ContiguousContainer<CreepRAW> implements CreepRAW {
  protected override byteLength = CREEP_BYTE_LENGTH;
}
export default CreepBW;
