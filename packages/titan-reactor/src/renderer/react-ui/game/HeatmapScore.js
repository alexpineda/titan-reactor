import { easeCubicOut } from "d3-ease";
import { unitTypes } from "../../../common/types/unitTypes";
import { orders } from "../../../common/types/orders";

export default class HeatmapScore {
  constructor(bwDat) {
    this.bwDat = bwDat;
  }

  totalScore(units, easing = easeCubicOut) {
    const n = units.reduce((sum, unit) => {
      return sum + this.unitScore(unit);
    }, 0);

    return easing(n / (units.length + 1));
  }

  unitScore(unit) {
    let score = 0;
    // ignore
    if (
      [
        unitTypes.siegeTankSiegeMode,
        unitTypes.darkSwarm,
        unitTypes.scannerSweep,
      ].includes(unit.typeId)
    ) {
      score = 0;
    }
    // modify
    else if (unit.typeId === unitTypes.siegeTurretSiegeMode) {
      const arcliteCannon =
        this.bwDat.weapons[this.bwDat.units[unit.typeId].groundWeapon];
      score = 1 - unit.groundWeaponCooldown / arcliteCannon.weaponCooldown;
      //as is
    } else {
      score = this.orderScore(unit.order);
    }
    unit.heatmapScore = score;
    return score;
  }

  orderScore(order) {
    switch (order) {
      case orders.castScannerSweep:
        return 0.4;
      case orders.holdPosition:
      case orders.interceptorAttack:
        return 0.6;
      case orders.move:
      case orders.burrowing:
      case orders.unburrowing:
      case orders.medicHeal:
      case orders.attackMove:
      case orders.attackFixedRange:
        return 1;
      case orders.attackUnit:
      case orders.castConsume:
      case orders.castDarkSwarm:
      case orders.castDefensiveMatrix:
      case orders.castDisruptionWeb:
      case orders.castEmpShockwave:
      case orders.castEnsnare:
      case orders.castFeedback:
      case orders.castHallucination:
      case orders.castInfestation:
      case orders.castIrradiate:
      case orders.castLockdown:
      case orders.castMaelstrom:
      case orders.castMindControl:
      case orders.castNuclearStrike:
      case orders.castOpticalFlare:
      case orders.castParasite:
      case orders.castPlague:
      case orders.castPsionicStorm:
      case orders.castRecall:
      case orders.castRestoration:
      case orders.castSpawnBroodlings:
      case orders.castStasisField:
      case orders.scarabAttack:
        //@todo is there unintended consequence to giving bonus score?
        return 1.2;
      default:
        return 0;
    }
  }

  unitOfInterestFilter(unit) {
    const unitType = this.bwDat.units[unit.typeId];
    if (unitType.isResourceMiner) {
      return [orders.attackMove, orders.attackUnit].includes(unit.order);
    } else if (
      [
        unitTypes.sunkenColony,
        unitTypes.sporeColony,
        unitTypes.bunker,
        unitTypes.photonCannon,
      ].includes(unit.typeId)
    ) {
      return true;
    } else if (unitType.isBuilding || unitType.isResourceContainer) {
      return false;
    } else if ([unitTypes.overlord, unitTypes.larva].includes(unit.typeId)) {
      return false;
    }
    return true;
  }

  unitsOfInterest(units) {
    return units.filter(this.unitOfInterestFilter);
  }
}
