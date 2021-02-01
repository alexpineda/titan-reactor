import { DAT } from "./DAT";
export class SoundsDAT extends DAT {
  constructor(readFile) {
    super(readFile);

    this.statFile = `arr/sfxdata.tbl`;

    this.format = [
      { size: 4, name: "file", get: this._statTxt() },
      { size: 1, name: "unknown1" },
      { size: 1, name: "flags" },
      { size: 2, name: "race" },
      { size: 1, name: "volume" },
    ];

    this.datname = "sfxdata.dat";
    this.filesize = 10296;
    this.count = 1144;
  }
}
