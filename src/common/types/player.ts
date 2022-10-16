import { Color } from "three";
import { StartLocation } from "./chk";

export interface Player {
    id: number;
    name: string;
    race: string;
    color: Color;
    vision: boolean;
    startLocation?: StartLocation;
}
