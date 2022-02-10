import { BwDAT } from "../../common/types";
import { UnitFlags, unitTypes, iscriptHeaders } from "../../common/bwdat/enums";
import { UnitStruct } from "../integration/structs";
import UnitsBufferView from "../integration/buffer-view/units-buffer-view";

export const isCloaked = (unit: UnitStruct) => {
  return (
    ((unit.statusFlags & UnitFlags.Cloaked) != 0 ||
      (unit.statusFlags & UnitFlags.PassivelyCloaked) != 0) &&
    unit.typeId !== unitTypes.spiderMine && !(unit.statusFlags & UnitFlags.Burrowed)
  );
}

export const isFlying = (unit: UnitStruct) => {
  return unit.statusFlags & UnitFlags.Flying
}

export const getAngle = (direction: number) => {
  direction -= 64;
  if (direction < 0)
    direction += 256;
  return direction * Math.PI / 128.0;
}

export const isAttacking = (u: UnitsBufferView, bwDat: BwDAT) => {
  if (u.orderTargetAddr === 0 || u.orderTargetUnit === 0) return false;
  const unit = u.subunit && bwDat.units[u.subunit.typeId].isTurret ? u.subunit : u;
  switch (unit.owSprite.mainImage.iscriptAnimation) {
    case iscriptHeaders.gndAttkInit:
    case iscriptHeaders.gndAttkRpt:
    case iscriptHeaders.airAttkInit:
    case iscriptHeaders.airAttkRpt:
      return true;
    default:
      return false;
  }
}