import { invertObj } from "ramda";
export const races = {
  zerg: 0,
  terran: 1,
  protoss: 2,
  all: 3,
};

export const racesById = invertObj(races);
