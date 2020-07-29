import { DAT } from "./DAT";
export class FlingyDAT extends DAT {
  constructor() {
    super();

    this.format = [
      { size: 2, name: "Sprite", get: this._datValue("Sprites") },
      { size: 4, name: "Speed" },
      { size: 2, name: "Acceleration" },
      { size: 4, name: "HaltDistance" },
      { size: 1, name: "TurnRadius" },
      { size: 1, name: "Unused" },
      {
        size: 1,
        name: "MovementControl",
        get: this._infoValue("FlingyControl"),
      },
    ];

    this.datname = "flingy.dat";
    this.idfile = "Flingy.txt";
    this.filesize = 3135;
    this.count = 209;
  }
}
