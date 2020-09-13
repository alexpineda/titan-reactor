import { DAT } from "./DAT";
export class TechDataDAT extends DAT {
  constructor(bwDataPath) {
    super(bwDataPath);

    this.format = [
      { size: 2, name: "mineralCost" },
      { size: 2, name: "vespeneCost" },
      { size: 2, name: "researchTime" }, //frames
      { size: 2, name: "energyRequired" },
      { size: 2, name: "researchRequirements" },
      { size: 2, name: "useRequirements" },
      { size: 2, name: "icon", get: this._infoValue("Icons") },
      { size: 2, name: "name", get: this._statTxt() },
      { size: 1, name: "race", get: this._infoValue("Races") },
      { size: 1, name: "researched" },
      { size: 1, name: "broodwarOnly" },
    ];

    this.datname = "techdata.dat";
    this.idfile = "Techdata.txt";
    this.filesize = 836;
    this.count = 44;
  }

  post(entries) {
    return entries.map((entry, i) => {
      entry.index = i;
    });
  }
}
