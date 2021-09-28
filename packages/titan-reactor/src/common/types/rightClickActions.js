import { invertObj } from "ramda";
export const rightClickActions = {
  noCommandsAutoAttack: 0,
  normalMovementNormalAttack: 1,
  normalMovementNoAttack: 2,
  noMovementNormalAttack: 3,
  harvest: 4,
  harvestAndRepair: 5,
  nothing: 6,
};

export const rightClickActionsById = invertObj(rightClickActions);
