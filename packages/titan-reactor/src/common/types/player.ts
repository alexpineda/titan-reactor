import { StartLocation } from "./chk";
import { Race } from "./common";
import { PlayerColor } from "./colors";

export type Player = {
  id: number;
  name: string;
  race: Race;
  color: PlayerColor;
  originalColor: PlayerColor;
  showActions: boolean;
  showPov: boolean;
  vision: boolean;
  startLocation?: StartLocation;
};
