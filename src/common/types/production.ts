export type IncompleteUnit = {
  unitId: number;
  typeId: number;
  remainingBuildTime: number;
  ownerId: number;
};

type BaseInProduction = {
  isTech?: boolean;
  isUpgrade?: boolean;
  count: number;
  icon: number;
  buildTime: number;
  remainingBuildTime: number;
  typeId: number;
  unitId: number;
  ownerId: number;
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
