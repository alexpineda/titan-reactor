import { DAT } from "./DAT";
export class UpgradesDAT extends DAT {
  constructor(bwDataPath) {
    super(bwDataPath);

    this.format = [
      { size: 2, name: "mineralCostBase" },
      { size: 2, name: "mineralCostFactor" },
      { size: 2, name: "vespeneCostBase" },
      { size: 2, name: "vespeneCostFactor" },
      { size: 2, name: "researchTimeBase" },
      { size: 2, name: "researchTimeFactor" },
      { size: 2, name: "requirements" },
      { size: 2, name: "icon", get: this._infoValue("Icons") },
      { size: 2, name: "name", get: this._statTxt() },
      { size: 1, name: "race", get: this._infoValue("Races") },
      { size: 1, name: "maxRepeats" },
      { size: 1, name: "broodwarOnly" },
    ];

    this.datname = "upgrades.dat";
    this.idfile = "Upgrades.txt";
    this.filesize = 1281;
    this.count = 61;
  }

  post(entries) {
    return entries.map((entry, i) => {
      entry.index = i;
    });
  }
}
