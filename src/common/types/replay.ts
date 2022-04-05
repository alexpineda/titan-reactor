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

export type ReplayCommand =
  | cmdRightClick
  | cmdSelectionAdd
  | cmdSelection
  | cmdSelectionRemove;

export const cmdIsRightClick = (tbd: ReplayCommand): tbd is cmdRightClick =>
  "x" in tbd && "y" in tbd;
