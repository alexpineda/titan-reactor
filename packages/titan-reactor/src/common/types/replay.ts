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

export type baseSelection = {
  player: number;
  id: number;
  frame: number;
};
export type cmdSelection = baseSelection & {
  unitTags: number[];
};
export type cmdSelectionAdd = cmdSelection;
export type cmdSelectionRemove = cmdSelectionAdd;
export type cmdRightClick = baseSelection & {
  x: number;
  y: number;
  unitTag: number;
  unit: number;
  queued: number;
};

export const cmdIsRightClick = (tbd: any): tbd is cmdRightClick =>
  tbd.x && tbd.y;

export type ReplayCommandType =
  | cmdRightClick
  | cmdSelectionAdd
  | cmdSelection
  | cmdSelectionRemove;
