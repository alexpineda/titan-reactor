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
  angle: number;
  remainingTrainTime: number;
  resourceAmount: number;
  order: number;
  kills: number;
}
