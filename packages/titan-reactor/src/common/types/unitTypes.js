import { invertObj } from "ramda";

export const unitTypes = {
  marine: 0x00,
  ghost: 0x01,
  vulture: 0x02,
  goliath: 0x03,
  goliathTurret: 0x04,
  siegeTankTankMode: 0x05,
  siegeTurretTankMode: 0x06,
  scv: 0x07,
  wraith: 0x08,
  scienceVessel: 0x09,
  dropship: 0x0b,
  battleCruiser: 0x0c,
  spiderMine: 0x0d,
  nuclearMissile: 0x0e,
  siegeTankSiegeMode: 0x1e,
  siegeTurretSiegeMode: 0x1f,
  firebat: 0x20,
  scannerSweep: 0x21,
  medic: 0x22,
  larva: 0x23,
  zergEgg: 0x24,
  zergling: 0x25,
  hydralisk: 0x26,
  ultralisk: 0x27,
  broodling: 0x28,
  drone: 0x29,
  overlord: 0x2a,
  mutalisk: 0x2b,
  guardian: 0x2c,
  queen: 0x2d,
  defiler: 0x2e,
  scourge: 0x2f,
  infestedTerran: 0x32,
  valkryie: 0x3a,
  mutaliskCocoon: 0x3b,
  corsair: 0x3c,
  darkTemplar: 0x3d,
  devourer: 0x3e,
  darkArchon: 0x3f,
  probe: 0x40,
  zealot: 0x41,
  dragoon: 0x42,
  highTemplar: 0x43,
  archon: 0x44,
  shuttle: 0x45,
  scout: 0x46,
  arbiter: 0x47,
  carrier: 0x48,
  interceptor: 0x49,
  reaver: 0x53,
  observer: 0x54,
  scarab: 0x55,
  rhynadon: 0x59,
  bengalaas: 0x5a,
  scantid: 0x5d,
  kakaru: 0x5e,
  ragnasaur: 0x5f,
  ursadon: 0x60,
  lurkerEgg: 0x61,
  lurker: 0x67,
  disruptionWeb: 0x69,
  commandCenter: 0x6a,
  comsatStation: 0x6b,
  nuclearSilo: 0x6c,
  supplyDepot: 0x6d,
  refinery: 0x6e,
  barracks: 0x6f,
  acadamy: 0x70,
  factory: 0x71,
  starport: 0x72,
  controlTower: 0x73,
  scienceFacility: 0x74,
  covertOps: 0x75,
  physicsLab: 0x76,
  machineShop: 0x78,
  engineeringBay: 0x7a,
  armory: 0x7b,
  missileTurret: 0x7c,
  bunker: 0x7d,
  infestedCommandCenter: 0x82,
  hatchery: 0x83,
  lair: 0x84,
  hive: 0x85,
  nydusCanal: 0x86,
  hydraDen: 0x87,
  defilerMound: 0x88,
  greaterSpire: 0x89,
  queensNest: 0x8a,
  evolutionChamber: 0x8b,
  ultraliskCavern: 0x8c,
  spire: 0x8d,
  spawningPool: 0x8e,
  creepColony: 0x8f,
  sporeColony: 0x90,
  sunkenColony: 0x92,
  zergOvermindWithShell: 0x93,
  zergOvermind: 0x94,
  extractor: 0x95,
  nexus: 0x9a,
  roboticsFacility: 0x9b,
  pylon: 0x9c,
  assimilator: 0x9d,
  observatory: 0x9f,
  gateway: 0xa0,
  photonCannon: 0xa2,
  citadelOfAdun: 0xa3,
  cyberneticsCore: 0xa4,
  templarArchives: 0xa5,
  forge: 0xa6,
  stargate: 0xa7,
  fleetBeacon: 0xa9,
  arbitalTribunal: 0xaa,
  roboticsSupportBay: 0xab,
  shieldBattery: 0xac,
  xelNagaTemple: 0xaf,
  mineral1: 0xb0,
  mineral2: 0xb1,
  mineral3: 0xb2,
  geyser: 0xbc,
  darkSwarm: 0xca,
  overmindCocoon: 0xc9,
  startLocation: 0xd6,
  none: 0xe4,
};

export const unitsByTypeId = invertObj(unitTypes);
