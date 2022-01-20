export interface UnitStruct {
  id: number;
  typeId: number;
  owner: number;
  x: number;
  y: number;
  hp: number;
  energy: number;
  shields: number;

  spriteTitanIndex: number;
  statusFlags: number;
  direction: number;
  remainingBuildTime: number;
  remainingTrainTime: number;
  resourceAmount: number;
  order: number;
  kills: number;
}
