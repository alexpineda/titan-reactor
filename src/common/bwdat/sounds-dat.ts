import { DAT } from "./dat";
import { ReadFile } from "../types";
/**
 * @public
 */
export interface SoundDAT {
    file: string;
    priority: number;
    flags: number;
    race: number;
    minVolume: number;
}

export class SoundsDAT extends DAT<SoundDAT> {
    constructor( readFile: ReadFile ) {
        super( readFile );

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
}
