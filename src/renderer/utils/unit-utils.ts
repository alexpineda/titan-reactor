import { BwDAT, UnitDAT, UnitStruct } from "common/types";
import { UnitFlags, unitTypes, iscriptHeaders, orders, upgrades } from "common/enums";
import UnitsBufferView from "../buffer-view/units-buffer-view";
import { Unit } from "@core/unit";

export const unitIsCompleted = (unit: UnitStruct) => {
  return unit.statusFlags & UnitFlags.Completed;
}

export const canSelectUnit = (unit: Unit) => {

  return Boolean(unit.typeId !== unitTypes.darkSwarm &&
    unit.typeId !== unitTypes.disruptionWeb &&
    unit.order !== orders.die &&
    !unit.extras.dat.isTurret &&
    (unit.statusFlags & UnitFlags.Loaded) === 0 &&
    (unit.statusFlags & UnitFlags.InBunker) === 0 &&
    unit.order !== orders.harvestGas &&
    unit.typeId !== unitTypes.spiderMine &&
    (unitIsCompleted(unit) || unit.extras.dat.isZerg || unit.extras.dat.isBuilding));
}

const _canOnlySelectOne = [
  unitTypes.larva,
  unitTypes.zergEgg,
  unitTypes.vespeneGeyser,
  unitTypes.mineral1,
  unitTypes.mineral2,
  unitTypes.mineral3,
  unitTypes.mutaliskCocoon,
  unitTypes.lurkerEgg,
];

export const canOnlySelectOne = (unit: UnitStruct) => _canOnlySelectOne.includes(unit.typeId)

export const unitIsCloaked = (unit: UnitStruct) => {
  return (
    ((unit.statusFlags & UnitFlags.Cloaked) != 0 ||
      (unit.statusFlags & UnitFlags.PassivelyCloaked) != 0) &&
    unit.typeId !== unitTypes.spiderMine && !(unit.statusFlags & UnitFlags.Burrowed)
  );
}

export const unitIsFlying = (unit: UnitStruct) => {
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


// ported from BWAPI
export const getMaxUnitEnergy = (unitType: UnitDAT, completedUpgrades: number[]) => {
  if (!unitType.isSpellcaster) return 0;
  let energy = unitType.isHero ? 250 : 200;

  if (
    (unitType.index === unitTypes.arbiter &&
      completedUpgrades.includes(upgrades.khaydarinCore)) ||
    (unitType.index === unitTypes.corsair &&
      completedUpgrades.includes(upgrades.argusJewel)) ||
    (unitType.index === unitTypes.darkArchon &&
      completedUpgrades.includes(upgrades.argusTalisman)) ||
    (unitType.index === unitTypes.highTemplar &&
      completedUpgrades.includes(upgrades.khaydarinAmulet)) ||
    (unitType.index === unitTypes.ghost &&
      completedUpgrades.includes(upgrades.moebiusReactor)) ||
    (unitType.index === unitTypes.battleCruiser &&
      completedUpgrades.includes(upgrades.colossusReactor)) ||
    (unitType.index === unitTypes.scienceVessel &&
      completedUpgrades.includes(upgrades.titanReactor)) ||
    (unitType.index === unitTypes.wraith &&
      completedUpgrades.includes(upgrades.apolloReactor)) ||
    (unitType.index === unitTypes.medic &&
      completedUpgrades.includes(upgrades.caduceusReactor)) ||
    (unitType.index === unitTypes.defiler &&
      completedUpgrades.includes(upgrades.metasynapticNode)) ||
    (unitType.index === unitTypes.queen &&
      completedUpgrades.includes(upgrades.gameteMeiosis))
  ) {
    energy = energy + 50;
  }

  return energy;
};
