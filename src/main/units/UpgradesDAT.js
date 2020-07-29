import { DAT } from "./DAT";
export class UpgradesDAT extends DAT {
  constructor() {
    super();

    this.format = [
      { size: 2, name: "MineralCostBase" },
      { size: 2, name: "MineralCostFactor" },
      { size: 2, name: "VespeneCostBase" },
      { size: 2, name: "VespeneCostFactor" },
      { size: 2, name: "ResearchTimeBase" },
      { size: 2, name: "ResearchTimeFactor" },
      { size: 2, name: "Requirements" },
      { size: 2, name: "Icon", get: this._infoValue("Icons") },
      { size: 2, name: "Label", get: this._statTxt() },
      { size: 1, name: "Race", get: this._infoValue("Races") },
      { size: 1, name: "MaxRepeats" },
      { size: 1, name: "BroodwarOnly" },
    ];

    this.datname = "upgrades.dat";
    this.idfile = "Upgrades.txt";
    this.filesize = 1281;
    this.count = 61;
  }
}
