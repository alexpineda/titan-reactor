import { DAT, ReadFileType } from "./DAT";

export type PortraitDatType = {
  filename: string;
};
export class PortraitsDAT extends DAT<PortraitDatType> {
  constructor(readFile: ReadFileType) {
    super(readFile);

    this.format = [
      {
        size: 4,
        name: "filename",
        get: this._statTxt(),
      },
      { size: 1, name: "SMKChange" },
      { size: 1, name: "Unknown" },
    ];

    this.datname = "portdata.dat";
    this.count = 220;
  }
}
