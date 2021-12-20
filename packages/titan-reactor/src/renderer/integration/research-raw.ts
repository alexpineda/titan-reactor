import { TechDataDAT } from "../../common/bwdat/core/tech-data-dat";

export interface ResearchRAW {
  owner: number;
  typeId: number;
  remainingBuildTime: number;
  unitId: number;
  dat: TechDataDAT;
}
