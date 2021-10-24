import { ColorRepresentation } from "three";
import { Race } from "./common";

export type ReplayPlayer = {
  id: number;
  name: string;
  race: Race;
  color: {
    hex: string;
    rgb: ColorRepresentation;
  };
};

type baseSelection = {
  player: number;
  id: number;
  frame: number;
};
type cmdSelection = baseSelection & {
  unitTags: number[];
};
type cmdSelectionAdd = cmdSelection;
type cmdSelectionRemove = cmdSelectionAdd;
type cmdRightClick = baseSelection & {
  x: number;
  y: number;
  unitTag: number;
  unit: number;
  queued: number;
};

export type ReplayCommandType =
  | cmdRightClick
  | cmdSelectionAdd
  | cmdSelection
  | cmdSelectionRemove;
