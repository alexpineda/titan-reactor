import { TechDataDAT } from "../../common/bwdat/core/tech-data-dat";

export interface ResearchRAW {
  ownerId: number;
  typeId: number;
  remainingBuildTime: number;
  unitId: number;
  dat: TechDataDAT;
}
