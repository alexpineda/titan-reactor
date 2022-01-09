import { UnitFlags, unitTypes } from "../../common/bwdat/enums";
import { UnitRAW } from "../integration/unit-raw";

export const isCloaked=(unit: UnitRAW) => {
    return (
      ((unit.statusFlags & UnitFlags.Cloaked) != 0 ||
        (unit.statusFlags & UnitFlags.PassivelyCloaked) != 0) &&
      unit.typeId !== unitTypes.spiderMine
    );
}

export const isFlying = (unit: UnitRAW) => {
  return unit.statusFlags & UnitFlags.Flying
}