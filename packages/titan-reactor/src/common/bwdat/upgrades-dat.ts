import { DAT } from "./dat";
import { ReadFile } from "../types";

export type UpgradeDAT = {
  mineralCostBase: number;
  mineralCostFactor: number;
  vespeneCostFactor: number;
  vespeneCostBase: number;
  researchTimeBase: number;
  researchTimeFactor: number;
  requirements: number;
  icon: number;
  name: string;
  maxRepeats: number;
  race: number;
};

export class UpgradesDAT extends DAT<UpgradeDAT> {
  constructor(readFile: ReadFile) {
    super(readFile);

    this.format = [
      { size: 2, name: "mineralCostBase" },
      { size: 2, name: "mineralCostFactor" },
      { size: 2, name: "vespeneCostBase" },
      { size: 2, name: "vespeneCostFactor" },
      { size: 2, name: "researchTimeBase" },
      { size: 2, name: "researchTimeFactor" },
      { size: 2, name: "requirements" },
      { size: 2, name: "icon" },
      { size: 2, name: "name", get: this._statTxt() },
      { size: 1, name: "race" },
      { size: 1, name: "maxRepeats" },
      { size: 1, name: "broodwarOnly" },
    ];

    this.datname = "upgrades.dat";
    this.count = 61;
  }
}
