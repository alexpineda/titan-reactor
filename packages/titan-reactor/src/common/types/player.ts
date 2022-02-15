import { StartLocation } from "./chk";
import { Race } from "./common";
import { PlayerColor } from "./colors";
import { Unit } from "../../renderer/core";

export type Player = {
  id: number;
  name: string;
  race: Race;
  color: PlayerColor;
  originalColor: PlayerColor;
  vision: boolean;
  startLocation?: StartLocation;
  pov: PlayerPOVI;
};

export interface POVSelectionI {
  lastIssuedCommand?: any;
  unit: Unit;
}

export interface PlayerPOVI {
  selections: POVSelectionI[];
  active: boolean;
}
