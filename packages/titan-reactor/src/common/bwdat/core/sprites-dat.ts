import range from "../../utils/range";
import { selectionCircleSize } from "../enums/selection-circle-size";
import { DAT } from "./dat";
import spriteNames from "./strings/sprite-names";
import { ImageDAT } from "./images-dat";
import { ReadFile } from "../../types";

export type SpriteDAT = {
  image: ImageDAT;
  name: string;
  index: number;
  healthBar: number;
  visible: number;
  selectionCircle: { size: number; index: number };
  selectionCircleOffset: number;
};

export class SpritesDAT extends DAT<SpriteDAT> {
  _hpBar() {
    return (value: number) => {
      return Math.floor((value - 1) / 3);
    };
  }

  constructor(readFile: ReadFile, images: ImageDAT[] = []) {
    super(readFile);

    this.format = [
      { size: 2, name: "image", get: (i) => images[i + 1] },
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
    this.count = 517;
  }

  override post(entries: SpriteDAT[]) {
    return entries.map((entry, i: number) => ({
      ...entry,
      index: i,
      name: spriteNames[i],
    }));
  }
}
