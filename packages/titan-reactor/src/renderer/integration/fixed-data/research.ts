import { ResearchRAW } from "../research-raw";
import ContiguousContainer from "./contiguous-container";

export const RESEARCH_BYTE_LENGTH = 6;
// research in progress
export class ResearchBW
  extends ContiguousContainer<ResearchRAW>
  implements ResearchRAW
{
  protected override byteLength = RESEARCH_BYTE_LENGTH;

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

  get dat() {
    if (!this.bwDat) {
      throw new Error("bwDat not set");
    }
    return this.bwDat.tech[this.typeId];
  }

  override object() {
    return {
      owner: this.owner,
      typeId: this.typeId,
      remainingBuildTime: this.remainingBuildTime,
      unitId: this.unitId,
      dat: this.dat,
    };
  }
}
export default ResearchBW;
