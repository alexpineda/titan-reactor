import { invertObj } from "ramda";

export const units = {
  marine: 0x0,
  scv: 0x7,
  dropship: 0xb,
  probe: 0x40,
  scarab: 0x55,
  rhynadon: 0x59,
  bengalaas: 0x5a,
  scantid: 0x5d,
  kakaru: 0x5e,
  ragnasaur: 0x5f,
  ursadon: 0x60,
  commandCenter: 0x6a,
  supply: 0x6d,
  refinery: 0x6e,
  barracks: 0x6f,
  nexus: 0x9a,
  pylon: 0x9c,
  assimilator: 0x9d,
  gateway: 0xa0,
  mineral1: 0xb0,
  mineral2: 0xb1,
  mineral3: 0xb2,
  geyser: 0xbc,
  startLocation: 0xd6,
};

export const unitsByTypeId = invertObj(units);
