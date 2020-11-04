import { DAT } from "./DAT";
export class FlingyDAT extends DAT {
  constructor(bwDataPath, sprites = {}) {
    super(bwDataPath);

    this.format = [
      { size: 2, name: "sprite", get: (i) => sprites[i] },
      { size: 4, name: "speed" },
      { size: 2, name: "acceleration" },
      { size: 4, name: "haltDistance" },
      { size: 1, name: "turnRadius" },
      { size: 1, name: "unused" },
      {
        size: 1,
        name: "movementControl",
      },
    ];

    this.datname = "flingy.dat";
    this.filesize = 3135;
    this.count = 209;
  }

  post(entries) {
    return entries.map((entry, i) => {
      entry.index = i;
    });
  }
}
