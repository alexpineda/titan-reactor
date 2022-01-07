import { ResearchRAW } from "../research-raw";
import BufferView from "./buffer-view";


// get dat() {
//   return this.bwDat.tech[this.typeId];
// }

// research in progress
export class ResearchBW
  extends BufferView<ResearchRAW>
  implements ResearchRAW {

  static STRUCT_SIZE = 6;


  get ownerId() {
    return this._readU(0);
  }

  get typeId() {
    return this._readU(1);
  }

  get remainingBuildTime() {
    return this._readU(2);
  }

  get unitId() {
    return this._readU(3);
  }

  override object() {
    return {
      ownerId: this.ownerId,
      typeId: this.typeId,
      remainingBuildTime: this.remainingBuildTime,
      unitId: this.unitId
    };
  }
}
export default ResearchBW;
