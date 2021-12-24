import { UpgradeDAT } from "../../common/types";

export interface UpgradeRAW {
  ownerId: number;
  typeId: number;
  level: number;
  remainingBuildTime: number;
  unitId: number;
  dat: UpgradeDAT;
}
