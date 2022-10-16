import { DAT } from "./dat";
import { SpriteDAT } from "./sprites-dat";
import { ReadFile } from "../types";

export interface FlingyDAT {
    sprite: SpriteDAT;
    speed: number;
    acceleration: number;
    haltDistance: number;
    turnRadius: number;
}

export class FlingiesDAT extends DAT<FlingyDAT> {
    protected override count = 209;
    constructor( readFile: ReadFile, sprites: SpriteDAT[] = [] ) {
        super( readFile );

        this.format = [
            { size: 2, name: "sprite", get: ( i ) => sprites[i] },
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
