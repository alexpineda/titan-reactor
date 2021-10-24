import { DAT, ReadFileType } from "./DAT";

export type TechDataDATType = {
  mineralCost: number,
  vespeneCost: number,
  researchCost: number,
  energyRequired: number,
  researchRequirements: number,
  useRequirements: number,
  icon: number,
  name: string,
  race: number,
  researched: number
}
export class TechDataDAT extends DAT {
  constructor(readFile: ReadFileType) {
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
    this.count = 44;
  }

  override async load() : Promise<TechDataDATType[]> {
    return super.load();
  }

}
