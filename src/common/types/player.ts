import { Color, Vector3 } from "three";

export interface Player {
    id: number;
    name: string;
    race: string;
    color: Color;
    vision: boolean;
    startLocation?: Vector3;
}
