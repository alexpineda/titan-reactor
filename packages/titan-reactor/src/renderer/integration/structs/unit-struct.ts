import { SpritesBufferView } from "../buffer-view";

export interface UnitStruct {
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
  resourceAmount: number;
  order: number | null;
  kills: number;

  orderTargetAddr: number;
  orderTargetX: number;
  orderTargetY: number;
  orderTargetUnit: number;

  subunit: UnitStruct | null;
  owSprite: SpritesBufferView;
}
