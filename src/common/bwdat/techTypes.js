import { invertObj } from "ramda";

const techTypes = {
  stimPacks: 0x00,
  lockdown: 0x01,
  empShockwave: 0x02,
  spiderMines: 0x03,
  scannerSweep: 0x04,
  tankSiegeMode: 0x05,
  defensiveMatrix: 0x06,
  irradiate: 0x07,
  yamatoGun: 0x08,
  cloakingField: 0x09,
  personnelCloaking: 0x0a,
  burrowing: 0x0b,
  infestation: 0x0c,
  spawnBroodlings: 0x0d,
  darkSwarm: 0x0e,
  plague: 0x0f,
  consume: 0x10,
  ensnare: 0x11,
  parasite: 0x12,
  psionicStorm: 0x13,
  hallucination: 0x14,
  recall: 0x15,
  stasisField: 0x16,
  archonWarp: 0x17,
  restoration: 0x18,
  disruptionWeb: 0x19,
  unk26: 0x1a,
  mindControl: 0x1b,
  darkArchonMeld: 0x1c,
  feedback: 0x1d,
  opticalFlare: 0x1e,
  maelstorm: 0x1f,
  lurkerAspect: 0x20,
  unk33: 0x21,
  healing: 0x22,
};

export const techTypesByTypeId = invertObj(techTypes);

export default techTypes;
