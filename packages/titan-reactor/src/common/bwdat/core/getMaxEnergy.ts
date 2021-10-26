import { unitTypes } from "../enums/unitTypes";
import { upgrades } from "../enums/upgrades";
import { UnitDAT } from "./UnitsDAT";

export default (unitType: UnitDAT, completedUpgrades: number[]) => {
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
