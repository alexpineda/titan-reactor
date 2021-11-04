const Version = {
  Starcraft: 59,
  Hybrid: 63,
  SCR: 64,
  Broodwar: 205,
  BroodwarRemastered: 206,
};

const tilesetNames = [
  "badlands",
  "platform",
  "install",
  "ashworld",
  "jungle",
  "desert",
  "ice",
  "twilight",
];

const chunkTypes = [
  "VER\x20",
  "VCOD",
  "OWNR",
  "ERA\x20",
  "DIM\x20",
  "SIDE",
  "MTXM",
  "PUNI",
  "UPGR",
  "PUPx",
  "PTEC",
  "PTEx",
  "UNIT",
  "TILE",
  "THG2",
  "MASK",
  "STR\x20",
  "STRx",
  "UPRP",
  "UPUS",
  "MRGN",
  "TRIG",
  "MBRF",
  "SPRP",
  "FORC",
  "WAV\x20",
  "UNIS",
  "UNIx",
  "UPGS",
  "UPGx",
  "TECS",
  "TECx",
  "COLR",
  "CRGB",
  "ISOM",
];

/*
  ignoring sections:
  
  "TYPE",
  "IVER",
  "IVE2",
  "IOWN",
  "ISOM",
  "DD2\x20",
  "SWNM",
  */

//OWNR, SIDE, FORC <- VCOD verification

module.exports = { Version, chunkTypes, tilesetNames };
