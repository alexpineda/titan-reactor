import { Player, UnitTag, UnitDAT } from "../../common/types";
import { BuildingQueueI } from "../integration/fixed-data";

export interface UnitInstance {
  id: UnitTag;
  owner: Player;
  hp: number;
  shields: number;
  typeId: number;
  order: number;
  energy: number;
  kills: number;

  x: number;
  y: number;
  tileX: number;
  tileY: number;

  unitType: UnitDAT;
  queue: BuildingQueueI | null;
  loaded: (UnitInstance | undefined)[] | null;

  remainingBuildTime: number;
  idleTime: number;
  recievingDamage: number;
  resourceAmount: number;
  remainingTrainTime: number;

  //@todo deprecate
  isComplete: boolean;
  wasConstructing: boolean;
  wasFlying: boolean;
  isNowFlying: boolean;
  isFlyingBuilding: boolean;
  dieTime: number;
  showOnMinimap: boolean;
  canSelect: boolean;
  warpingIn?: number;
  warpingLen: number;
  unitId: number;
  ownerId: number;
}

export type IncompleteUnit = {
  unitId: number;
  typeId: number;
  ownerId: number;
};

type BaseInProduction = {
  isTech?: boolean;
  isUpgrade?: boolean;
  count: number;
  icon: number;
  buildTime: number;
  remainingBuildTime: number;
  owner: number;
  typeId: number;
  unitId: number;
};

export type UnitInProduction = IncompleteUnit & BaseInProduction;

export type ResearchInProduction = BaseInProduction & {
  isTech: true;
  timeAdded: number;
};

export type ResearchCompleted = ResearchInProduction & {
  timeCompleted: number;
};

export type UpgradeInProduction = BaseInProduction & {
  isUpgrade: true;
  timeAdded: number;
};

export type UpgradeCompleted = UpgradeInProduction & {
  timeCompleted: number;
};
