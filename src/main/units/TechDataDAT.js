import { DAT } from "./DAT";
export class TechDataDAT extends DAT {
  constructor() {
    super();

    this.format = [
      { size: 2, name: "MineralCost" },
      { size: 2, name: "VespeneCost" },
      { size: 2, name: "ResearchTime" }, //frames, to get seconds divide by 24
      { size: 2, name: "EnergyRequired" },
      { size: 2, name: "ResearchRequirements" },
      { size: 2, name: "UseRequirements" },
      { size: 2, name: "Icon", get: this._infoValue("Icons") },
      { size: 2, name: "Label", get: this._statTxt("Technology Label") },
      { size: 1, name: "Race", get: this._infoValue("Races") },
      { size: 1, name: "Researched" },
      { size: 1, name: "BroodwarOnly" },
    ];

    this.datname = "techdata.dat";
    this.idfile = "Techdata.txt";
    this.filesize = 836;
    this.count = 44;
  }
}
