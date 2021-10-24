import { DAT, ReadFileType } from "./DAT";

export type SoundDATType = {
  file: string,
  priority: number,
  flags: number,
  race: number,
  minVolume: number
}

export class SoundsDAT extends DAT {
  constructor(readFile: ReadFileType) {
    super(readFile);

    this.statFile = "arr/sfxdata.tbl";

    this.format = [
      { size: 4, name: "file", get: this._statTxt() },
      { size: 1, name: "priority" },
      { size: 1, name: "flags" },
      { size: 2, name: "race" },
      { size: 1, name: "minVolume" },
    ];

    this.datname = "sfxdata.dat";
    this.count = 1144;
  }

  override async load() : Promise<SoundDATType[]> {
    return super.load();
  }
}
