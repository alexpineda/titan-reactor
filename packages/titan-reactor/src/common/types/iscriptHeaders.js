import { invertObj } from "ramda";

export const iscriptHeaders = {
  init: 0x00,
  death: 0x01,
  gndAttkInit: 0x02,
  airAttkInit: 0x03,
  unused1: 0x04,
  gndAttkRpt: 0x05,
  airAttkRpt: 0x06,
  castSpell: 0x07,
  gndAttkToIdle: 0x08,
  airAttkToIdle: 0x09,
  unused2: 0x0a,
  walking: 0x0b,
  walkingToIdle: 0x0c,
  specialState1: 0x0d,
  specialState2: 0x0e,
  almostBuilt: 0xf,
  built: 0x10,
  landing: 0x11,
  liftOff: 0x12,
  working: 0x13,
  workingToIdle: 0x14,
  warpIn: 0x15,
  unused3: 0x16,
  starEditInit: 0x17,
  disable: 0x18,
  burrow: 0x19,
  unBurrow: 0x1a,
  enable: 0x1b,
};

export const headersById = invertObj(iscriptHeaders);
