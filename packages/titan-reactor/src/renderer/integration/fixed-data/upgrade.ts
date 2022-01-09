import { UpgradeStruct } from "../data-transfer";
import BufferView from "./buffer-view";

export const UPGRADE_BYTE_LENGTH = 7;


// get dat() {
//   if (!this.bwDat) {
//     throw new Error("bwDat not set");
//   }
//   return this.bwDat.upgrades[this.typeId];
// }

// upgrades in progress
export class UpgradeBW
  extends BufferView<UpgradeStruct>
  implements UpgradeStruct {

  get ownerId() {
    return this._readU(0);
  }

  get typeId() {
    return this._readU(1);
  }

  get level() {
    return this._readU(2);
  }

  get remainingBuildTime() {
    return this._readU(3);
  }

  get unitId() {
    return this._readU(5);
  }


  override object() {
    return {
      ownerId: this.ownerId,
      typeId: this.typeId,
      level: this.level,
      remainingBuildTime: this.remainingBuildTime,
      unitId: this.unitId,
    };
  }
}
export default UpgradeBW;
