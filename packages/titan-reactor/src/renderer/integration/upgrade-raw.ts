import { UpgradeDAT } from "../../common/types";

export interface UpgradeRAW {
  owner: number;
  typeId: number;
  level: number;
  remainingBuildTime: number;
  unitId: number;
  dat: UpgradeDAT;
}
