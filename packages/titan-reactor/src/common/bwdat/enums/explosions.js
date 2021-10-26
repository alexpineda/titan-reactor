import invertObj from "../../utils/invertObj";

export const explosions = {
  none: 0,
  normalHit: 1,
  splashRadial: 2,
  splashEnemy: 3,
  lockdown: 4,
  nuclearMissile: 5,
  parasite: 6,
  broodlings: 7,
  empShockwave: 8,
  irradiate: 9,
  ensnare: 10,
  plague: 11,
  stasisField: 12,
  darkSwarm: 13,
  consume: 14,
  yamatoGun: 15,
  restoration: 16,
  disruptionWeb: 17,
  corrosiveAcid: 18,
  mindControl: 19,
  feedback: 20,
  opticalFlare: 21,
  maelstrom: 22,
  unknown: 23,
  splashAir: 24,
};

export const explosionsById = invertObj(explosions);
