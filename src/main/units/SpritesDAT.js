import { DAT } from "./DAT";
import { range } from "ramda";

export class SpritesDAT extends DAT {
  _hpBar = () => (value) => {
    return Math.floor((value - 1) / 3);
  };

  constructor(bwDataPath) {
    super(bwDataPath);

    this.format = [
      { size: 2, name: "ImageFile", get: this._datValue("Images") },
      {
        size: 1,
        name: "HealthBar",
        get: this._hpBar(),
        range: () => range(130, 517),
      },
      { size: 1, name: "Unknown" },
      { size: 1, name: "IsVisible" },
      {
        size: 1,
        name: "SelectionCircleImage",
        get: this._infoValue("SelCircleSize"),
        range: () => range(130, 517),
      },
      { size: 1, name: "SelectionCircleOffset", range: () => range(130, 517) },
    ];

    this.datname = "sprites.dat";
    this.idfile = "Sprites.txt";
    this.filesize = 3229;
    this.count = 517;
  }
}
