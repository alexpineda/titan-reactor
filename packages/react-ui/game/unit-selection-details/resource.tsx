import React, { useEffect, useRef } from "react";
import { Unit } from "../../../core";
import { unitTypes } from "../../../../common/bwdat/enums";
import {
  useGameStore,
  useUnitSelectionStore,
  UnitSelectionStore,
} from "../../../stores";
import { AssetsMissingError } from "../../../../common/errors";

const selectedUnitAmountSelector = (state: UnitSelectionStore) => {
  if (!state.selectedUnits[0]) return "";
  return state.selectedUnits[0].resourceAmount;
};

interface Props {
  unit: Unit;
}
const Resource = ({ unit }: Props) => {
  const gameIcons = useGameStore((state) => state?.assets?.gameIcons);
  if (!gameIcons) {
    throw new AssetsMissingError("gameIcons");
  }

  const resourceRef = useRef<HTMLParagraphElement>(null);

  let icon = gameIcons.minerals;

  if (
    ![unitTypes.mineral1, unitTypes.mineral2, unitTypes.mineral3].includes(
      unit.dat.index
    )
  ) {
    if (unit.dat.isZerg) {
      icon = gameIcons.vespeneZerg;
    } else if (unit.dat.isProtoss) {
      icon = gameIcons.vespeneProtoss;
    } else {
      icon = gameIcons.vespeneTerran;
    }
  }

  const setDom = (resourceAmount: number | string | null) => {
    if (!resourceRef.current) return;
    resourceRef.current.textContent = String(resourceAmount ?? "");
  };

  useEffect(() => {
    setDom(unit.resourceAmount);

    return useUnitSelectionStore.subscribe((resourceAmount) => {
      setDom(resourceAmount);
    }, selectedUnitAmountSelector);
  }, [unit]);

  return (
    <span className="flex items-center">
      <img className="inline w-4 mr-1" src={icon} />
      <p ref={resourceRef} className="text-gray-400 inline"></p>
    </span>
  );
};

export default Resource;
