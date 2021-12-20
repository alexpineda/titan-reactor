import { UpgradeRAW } from "../upgrade-raw";
import ContiguousContainer from "./contiguous-container";

export const UPGRADE_BYTE_LENGTH = 7;

// upgrades in progress
export class UpgradeBW
  extends ContiguousContainer<UpgradeRAW>
  implements UpgradeRAW
{
  protected override byteLength = UPGRADE_BYTE_LENGTH;

  get owner() {
    return this._readU8(0);
  }

  get typeId() {
    return this._readU8(1);
  }

  get level() {
    return this._readU8(2);
  }

  get remainingBuildTime() {
    return this._readU16(3);
  }

  get unitId() {
    return this._readU16(5);
  }

  get dat() {
    if (!this.bwDat) {
      throw new Error("bwDat not set");
    }
    return this.bwDat.upgrades[this.typeId];
  }

  override object() {
    return {
      owner: this.owner,
      typeId: this.typeId,
      level: this.level,
      remainingBuildTime: this.remainingBuildTime,
      unitId: this.unitId,
      dat: this.dat,
    };
  }
}
export default UpgradeBW;
