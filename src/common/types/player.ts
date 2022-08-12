import { Color } from "three";
import { StartLocation } from "./chk";

export type Player = {
  id: number;
  name: string;
  race: string;
  color: Color;
  vision: boolean;
  startLocation?: StartLocation;
};