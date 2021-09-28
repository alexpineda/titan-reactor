import upgradeTypes from "../types/upgrades";
import { unitTypes } from "../types/unitTypes";

export default (unitType, completedUpgrades) => {
  if (!unitType.isSpellcaster) return 0;
  let energy = unitType.isHero ? 250 : 200;

  if (
    (unitType.index === unitTypes.arbiter &&
      completedUpgrades.includes(upgradeTypes.khaydarinCore)) ||
    (unitType.index === unitTypes.corsair &&
      completedUpgrades.includes(upgradeTypes.argusJewel)) ||
    (unitType.index === unitTypes.darkArchon &&
      completedUpgrades.includes(upgradeTypes.argusTalisman)) ||
    (unitType.index === unitTypes.highTemplar &&
      completedUpgrades.includes(upgradeTypes.khaydarinAmulet)) ||
    (unitType.index === unitTypes.ghost &&
      completedUpgrades.includes(upgradeTypes.moebiusReactor)) ||
    (unitType.index === unitTypes.battleCruiser &&
      completedUpgrades.includes(upgradeTypes.colossusReactor)) ||
    (unitType.index === unitTypes.scienceVessel &&
      completedUpgrades.includes(upgradeTypes.titanReactor)) ||
    (unitType.index === unitTypes.wraith &&
      completedUpgrades.includes(upgradeTypes.apolloReactor)) ||
    (unitType.index === unitTypes.medic &&
      completedUpgrades.includes(upgradeTypes.caduceusReactor)) ||
    (unitType.index === unitTypes.defiler &&
      completedUpgrades.includes(upgradeTypes.metasynapticNode)) ||
    (unitType.index === unitTypes.queen &&
      completedUpgrades.includes(upgradeTypes.gameteMeiosis))
  ) {
    energy = energy + 50;
  }

  return energy;
};
