import { UnitDAT } from "../../common/types/bwdat";

export interface UnitRAW {
  id: number;
  typeId: number;
  owner: number;
  x: number;
  y: number;
  hp: number;
  energy: number;
  shields: number;

  spriteIndex: number;
  statusFlags: number;
  direction: number;
  remainingBuildTime: number;
  remainingTrainTime: number;
  angle: number;
  dat: UnitDAT;
  isFlying: boolean;
  isCloaked: boolean;
  isComplete: boolean;
  tileX: number;
  tileY: number;
  order: number;
  kills: number;
  resourceAmount: number | null;
}
