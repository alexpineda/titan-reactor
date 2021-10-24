import { Player } from "../../common/types/player";
import { BuildingQueueI } from "../game-data/BuildingQueueCountBW";

export interface GameUnitI {
  id: number;
  owner: Player;
  hp: number;
  shields: number;
  typeId: number;
  order: number;

  x: number;
  y: number;
  tileX: number;
  tileY: number;

  queue: BuildingQueueI | null;
  loaded: (GameUnitI | undefined)[] | null;

  remainingBuildTime: number;
  idleTime: number;
  recievingDamage: number;

  //@todo deprecate
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
  remainingBuildTime: number;
  ownerId: number;
};

type BaseInProduction = {
  count: number;
  icon: number;
  buildTime: number;
};

export type UnitInProduction = IncompleteUnit & BaseInProduction;

export type ResearchInProduction = BaseInProduction & {
  isTech: true;
  timeAdded: number;
};

export type UpgradeInProduction = BaseInProduction & {
  isUpgrade: true;
  timeAdded: number;
};
