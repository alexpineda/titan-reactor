import { DAT } from "./DAT";
export class SoundsDAT extends DAT {
  constructor(bwDataPath) {
    super(bwDataPath);

    this.statFile = `${bwDataPath}/arr/sfxdata.tbl`;

    this.format = [
      { size: 4, name: "Soundfile", get: this._statTxt() },
      { size: 1, name: "Unknown1" },
      { size: 1, name: "Flags" },
      { size: 2, name: "Race", get: this._infoValue("Races") },
      { size: 1, name: "Volume" },
    ];

    this.datname = "sfxdata.dat";
    this.idfile = "Sfxdata.txt";
    this.filesize = 10296;
    this.count = 1144;
  }
}
