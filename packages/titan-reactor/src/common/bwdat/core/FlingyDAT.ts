import { DAT, ReadFileType } from "./DAT";
import { SpriteDATType } from "./SpritesDAT";

export type FlingyDATType = {
  sprite: SpriteDATType;
  speed: number;
  acceleration: number;
  haltDistance: number;
  turnRadius: number;
};

export class FlingyDAT extends DAT<FlingyDATType> {
  protected override count = 209;
  constructor(readFile: ReadFileType, sprites: SpriteDATType[] = []) {
    super(readFile);

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
  }
}
