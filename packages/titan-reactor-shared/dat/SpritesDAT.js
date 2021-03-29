import { DAT } from "./DAT";
import { range } from "ramda";
import { selectionCircleSize } from "titan-reactor-shared/types/selectionCircleSize";
import SpritesListDefinition from "./Data/SpritesListDefinition.js";

export class SpritesDAT extends DAT {
  _hpBar() {
    return (value) => {
      return Math.floor((value - 1) / 3);
    };
  }

  constructor(readFile, images = {}) {
    super(readFile);

    this.format = [
      { size: 2, name: "image", get: (i) => images[i] },
      {
        size: 1,
        name: "healthBar",
        // get: this._hpBar(),
        range: () => range(130, 517),
      },
      { size: 1, name: "unknown" },
      { size: 1, name: "visible" },
      {
        size: 1,
        name: "selectionCircle",
        get: (i) => selectionCircleSize[i],
        range: () => range(130, 517),
      },
      { size: 1, name: "selectionCircleOffset", range: () => range(130, 517) },
    ];

    this.datname = "sprites.dat";
    this.filesize = 3229;
    this.count = 517;
  }

  post(entries) {
    return entries.map((entry, i) => {
      entry.index = i;
      entry.name = SpritesListDefinition[i];
    });
  }
}
