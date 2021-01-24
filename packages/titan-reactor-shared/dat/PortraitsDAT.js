import { DAT } from "./DAT";
export class PortraitsDAT extends DAT {
  constructor(bwDataPath) {
    super(bwDataPath);

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
    this.filesize = 1320;
    this.count = 220;
  }
}
