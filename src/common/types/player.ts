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

export type ReplayPlayer = {
  id: number;
  name: string;
  race: "zerg" | "terran" | "protoss" | "unknown";
  team: number;
  color: string;

  isComputer: boolean;
  isHuman: boolean;
  isActive: boolean;
}