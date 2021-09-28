import { DAT } from "./DAT";
export class TechDataDAT extends DAT {
  constructor(readFile) {
    super(readFile);

    this.format = [
      { size: 2, name: "mineralCost" },
      { size: 2, name: "vespeneCost" },
      { size: 2, name: "researchTime" }, //frames
      { size: 2, name: "energyRequired" },
      { size: 2, name: "researchRequirements" },
      { size: 2, name: "useRequirements" },
      { size: 2, name: "icon" },
      { size: 2, name: "name", get: this._statTxt() },
      { size: 1, name: "race" },
      { size: 1, name: "researched" },
      { size: 1, name: "broodwarOnly" },
    ];

    this.datname = "techdata.dat";
    this.filesize = 836;
    this.count = 44;
  }

  post(entries) {
    return entries.map((entry, i) => {
      entry.index = i;
    });
  }
}
