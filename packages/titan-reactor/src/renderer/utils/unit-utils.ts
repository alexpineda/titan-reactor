import { UnitFlags, unitTypes } from "../../common/bwdat/enums";
import { UnitStruct } from "../integration/data-transfer/unit-struct";

export const isCloaked=(unit: UnitStruct) => {
    return (
      ((unit.statusFlags & UnitFlags.Cloaked) != 0 ||
        (unit.statusFlags & UnitFlags.PassivelyCloaked) != 0) &&
      unit.typeId !== unitTypes.spiderMine
    );
}

export const isFlying = (unit: UnitStruct) => {
  return unit.statusFlags & UnitFlags.Flying
}