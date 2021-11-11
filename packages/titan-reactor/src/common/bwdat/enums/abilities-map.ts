import { techTypes } from "./tech-types";
import { unitTypes } from "./unit-types";
import { upgrades } from "./upgrades";

export const unitsByUpgradeType = {
  [upgrades.terranInfantryArmor]: [
    unitTypes.marine,
    unitTypes.ghost,
    unitTypes.scv,
    unitTypes.firebat,
    unitTypes.medic,
  ],
  [upgrades.terranVehiclePlating]: [
    unitTypes.vulture,
    unitTypes.goliath,
    unitTypes.siegeTankTankMode,
    unitTypes.siegeTurretSiegeMode,
  ],
  [upgrades.terranShipPlating]: [
    unitTypes.wraith,
    unitTypes.scienceVessel,
    unitTypes.dropship,
    unitTypes.battleCruiser,
    unitTypes.valkryie,
  ],
  [upgrades.zergCarapace]: [
    unitTypes.zergEgg,
    unitTypes.larva,
    unitTypes.hydralisk,
    unitTypes.zergling,
    unitTypes.ultralisk,
    unitTypes.broodling,
    unitTypes.drone,
    unitTypes.defiler,
    unitTypes.infestedTerran,
    unitTypes.mutaliskCocoon,
    unitTypes.lurkerEgg,
    unitTypes.lurker,
  ],

  [upgrades.zergFlyerCarapace]: [
    unitTypes.overlord,
    unitTypes.mutalisk,
    unitTypes.guardian,
    unitTypes.queen,
    unitTypes.scourge,
    unitTypes.devourer,
  ],
  [upgrades.protossArmor]: [
    unitTypes.darkTemplar,
    unitTypes.darkArchon,
    unitTypes.probe,
    unitTypes.zealot,
    unitTypes.dragoon,
    unitTypes.highTemplar,
    unitTypes.archon,
    unitTypes.reaver,
  ],
  [upgrades.protossPlating]: [
    unitTypes.corsair,
    unitTypes.shuttle,
    unitTypes.scout,
    unitTypes.arbiter,
    unitTypes.carrier,
    unitTypes.interceptor,
    unitTypes.observer,
  ],
  [upgrades.terranInfantryWeapons]: [
    unitTypes.marine,
    unitTypes.ghost,
    unitTypes.firebat,
  ],
  [upgrades.terranVehicleWeapons]: [
    unitTypes.vulture,
    unitTypes.goliath,
    unitTypes.siegeTankTankMode,
    unitTypes.siegeTurretSiegeMode,
  ],
  [upgrades.terranShipWeapons]: [
    unitTypes.wraith,
    unitTypes.battleCruiser,
    unitTypes.valkryie,
  ],
  [upgrades.zergMeleeAttacks]: [
    unitTypes.zergling,
    unitTypes.broodling,
    unitTypes.ultralisk,
  ],
  [upgrades.zergFlyerAttacks]: [
    unitTypes.mutalisk,
    unitTypes.guardian,
    unitTypes.devourer,
  ],
  [upgrades.protossGroundWeapons]: [
    unitTypes.zealot,
    unitTypes.dragoon,
    unitTypes.archon,
    unitTypes.darkTemplar,
  ],
  [upgrades.protossAirWeapons]: [
    unitTypes.scout,
    unitTypes.arbiter,
    unitTypes.interceptor,
    unitTypes.carrier,
    unitTypes.corsair,
  ],
  [upgrades.protossPlasmaShields]: [
    unitTypes.corsair,
    unitTypes.darkTemplar,
    unitTypes.darkArchon,
    unitTypes.probe,
    unitTypes.zealot,
    unitTypes.dragoon,
    unitTypes.highTemplar,
    unitTypes.archon,
    unitTypes.shuttle,
    unitTypes.scout,
    unitTypes.arbiter,
    unitTypes.carrier,
    unitTypes.interceptor,
    unitTypes.reaver,
    unitTypes.observer,
  ],
  [upgrades.u238Shells]: [unitTypes.marine],
  [upgrades.ionThrusters]: [unitTypes.vulture],
  [upgrades.titanReactor]: [unitTypes.scienceVessel],
  [upgrades.moebiusReactor]: [unitTypes.ghost],
  [upgrades.ocularImplants]: [unitTypes.ghost],
  [upgrades.apolloReactor]: [unitTypes.wraith],
  [upgrades.colossusReactor]: [unitTypes.battleCruiser],
  [upgrades.ventralSacs]: [unitTypes.overlord],
  [upgrades.antennae]: [unitTypes.overlord],
  [upgrades.pneumatizedCarapace]: [unitTypes.overlord],
  [upgrades.metabolicBoost]: [unitTypes.zergling],
  [upgrades.adrenalGlands]: [unitTypes.zergling],
  [upgrades.muscularAugments]: [unitTypes.hydralisk],
  [upgrades.groovedSpines]: [unitTypes.hydralisk],
  [upgrades.gameteMeiosis]: [unitTypes.queen],
  [upgrades.metasynapticNode]: [unitTypes.defiler],
  [upgrades.singularityCharge]: [unitTypes.dragoon],
  [upgrades.legEnhancements]: [unitTypes.zealot],
  [upgrades.scarabDamage]: [unitTypes.reaver],
  [upgrades.reaverCapacity]: [unitTypes.reaver],
  [upgrades.graviticDrive]: [unitTypes.shuttle],
  [upgrades.graviticBoosters]: [unitTypes.observer],
  [upgrades.sensorArray]: [unitTypes.observer],
  [upgrades.khaydarinAmulet]: [unitTypes.highTemplar],
  [upgrades.apialSensors]: [unitTypes.scout],
  [upgrades.graviticThrusters]: [unitTypes.scout],
  [upgrades.carrierCapacity]: [unitTypes.carrier],
  [upgrades.khaydarinCore]: [unitTypes.arbiter],
  [upgrades.argusJewel]: [unitTypes.corsair],
  [upgrades.argusTalisman]: [unitTypes.darkArchon],
  [upgrades.caduceusReactor]: [unitTypes.medic],
  [upgrades.anabolicSynthesis]: [unitTypes.ultralisk],
  [upgrades.chitinousPlating]: [unitTypes.ultralisk],
  [upgrades.charonBooster]: [unitTypes.goliath],
};

export const upgradesByUnitType = Object.keys(unitsByUpgradeType)
  .map((n) => Number(n))
  .reduce((memo: Record<number, number[]>, upgradeType: number) => {
    for (const unitType of unitsByUpgradeType[upgradeType]) {
      if (memo[unitType]) {
        memo[unitType].push(Number(upgradeType));
      } else {
        memo[unitType] = [Number(upgradeType)];
      }
    }
    return memo;
  }, {});

export const unitsByTechType = {
  [techTypes.stimPacks]: [unitTypes.marine, unitTypes.firebat],
  [techTypes.lockdown]: [unitTypes.ghost],
  [techTypes.empShockwave]: [unitTypes.scienceVessel],
  [techTypes.spiderMines]: [unitTypes.vulture],
  [techTypes.scannerSweep]: [unitTypes.comsatStation],
  [techTypes.tankSiegeMode]: [
    unitTypes.siegeTankTankMode,
    unitTypes.siegeTankSiegeMode,
  ],
  [techTypes.defensiveMatrix]: [unitTypes.scienceVessel],
  [techTypes.irradiate]: [unitTypes.scienceVessel],
  [techTypes.yamatoGun]: [unitTypes.battleCruiser],
  [techTypes.cloakingField]: [unitTypes.wraith],
  [techTypes.personnelCloaking]: [unitTypes.ghost],
  [techTypes.burrowing]: [
    unitTypes.zergling,
    unitTypes.hydralisk,
    unitTypes.drone,
    unitTypes.defiler,
    unitTypes.infestedTerran,
    unitTypes.lurker,
  ],
  [techTypes.infestation]: [unitTypes.queen],
  [techTypes.spawnBroodlings]: [unitTypes.queen],
  [techTypes.ensnare]: [unitTypes.queen],
  [techTypes.parasite]: [unitTypes.queen],
  [techTypes.darkSwarm]: [unitTypes.defiler],
  [techTypes.plague]: [unitTypes.defiler],
  [techTypes.consume]: [unitTypes.defiler],
  [techTypes.psionicStorm]: [unitTypes.highTemplar],
  [techTypes.hallucination]: [unitTypes.highTemplar],
  [techTypes.recall]: [unitTypes.arbiter],
  [techTypes.stasisField]: [unitTypes.arbiter],
  [techTypes.archonWarp]: [unitTypes.highTemplar],
  [techTypes.restoration]: [unitTypes.medic],
  [techTypes.opticalFlare]: [unitTypes.medic],
  [techTypes.disruptionWeb]: [unitTypes.corsair],
  [techTypes.mindControl]: [unitTypes.darkArchon],
  [techTypes.darkArchonMeld]: [unitTypes.darkTemplar],
  [techTypes.feedback]: [unitTypes.darkTemplar],
  [techTypes.maelstorm]: [unitTypes.darkTemplar],
  [techTypes.lurkerAspect]: [unitTypes.hydralisk],
  [techTypes.healing]: [unitTypes.medic],
};

export const techTypesByUnitType = Object.keys(unitsByTechType)
  .map((n) => Number(n))
  .reduce((memo: Record<number, number[]>, techType: number) => {
    for (const unitType of unitsByTechType[techType]) {
      if (memo[unitType]) {
        memo[unitType].push(Number(techType));
      } else {
        memo[unitType] = [Number(techType)];
      }
    }
    return memo;
  }, {});
