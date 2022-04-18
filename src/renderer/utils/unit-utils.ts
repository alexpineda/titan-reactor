import { BwDAT, UnitStruct } from "common/types";
import { UnitFlags, unitTypes, iscriptHeaders, orders } from "common/enums";
import UnitsBufferView from "../buffer-view/units-buffer-view";
import { Unit } from "@core/unit";

export const unitIsCompleted = (unit: UnitStruct) => {
  return unit.statusFlags & UnitFlags.Completed;
}

export const canSelectUnit = (unit: Unit) => {

  return Boolean(unit.typeId !== unitTypes.darkSwarm &&
    unit.typeId !== unitTypes.disruptionWeb &&
    unit.hp > 0 &&
    !unit.extras.dat.isTurret &&
    (unit.statusFlags & UnitFlags.Loaded) === 0 &&
    (unit.statusFlags & UnitFlags.InBunker) === 0 &&
    unit.order !== orders.harvestGas &&
    unit.typeId !== unitTypes.spiderMine &&
    (unitIsCompleted(unit) || unit.extras.dat.isZerg || unit.extras.dat.isBuilding));
}

export const unitIsCloaked = (unit: UnitStruct) => {
  return (
    ((unit.statusFlags & UnitFlags.Cloaked) != 0 ||
      (unit.statusFlags & UnitFlags.PassivelyCloaked) != 0) &&
    unit.typeId !== unitTypes.spiderMine && !(unit.statusFlags & UnitFlags.Burrowed)
  );
}

export const unitIsFlying = (unit: Unit) => {
  return Boolean(unit.statusFlags & UnitFlags.Flying);
}

export const getAngle = (direction: number) => {
  direction -= 64;
  if (direction < 0)
    direction += 256;
  return direction * Math.PI / 128.0;
}

export const unitIsAttacking = (u: UnitsBufferView, bwDat: BwDAT) => {
  if (u.orderTargetAddr === 0 || u.orderTargetUnit === 0) return undefined;
  const unit = u.subunit && bwDat.units[u.subunit.typeId].isTurret ? u.subunit : u;
  switch (unit.owSprite.mainImage.iscriptAnimation) {
    case iscriptHeaders.gndAttkInit:
    case iscriptHeaders.gndAttkRpt:
      return bwDat.weapons[bwDat.units[unit.typeId].groundWeapon];
    case iscriptHeaders.airAttkInit:
    case iscriptHeaders.airAttkRpt:
      return bwDat.weapons[bwDat.units[unit.typeId].airWeapon];
    default:
      return undefined;
  }
}