import { SpritesBufferView } from "../buffer-view";
import { FlingyStruct } from "./flingy-struct";

export interface UnitStruct extends FlingyStruct {
  id: number;
  typeId: number;
  owner: number;
  energy: number;
  shields: number;

  statusFlags: number;
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
}
