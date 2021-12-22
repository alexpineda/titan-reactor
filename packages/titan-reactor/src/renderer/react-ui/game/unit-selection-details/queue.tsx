import React, { useEffect, useRef } from "react";
import shallow from "zustand/shallow";

import { unitTypes } from "../../../../common/bwdat/enums";
import {
  useGameStore,
  useProductionStore,
  useUnitSelectionStore,
  UnitSelectionStore,
} from "../../../stores";
import { ResearchCompleted, UpgradeCompleted } from "../../../../common/types";
import { AssetsMissingError } from "../../../../common/errors";
import { Unit } from "../../../core";

type SelectedUnits = Pick<UnitSelectionStore, "selectedUnits">;

interface Props {
  unit: Unit;
}
const researchIconSelector = (state: SelectedUnits) => {
  if (!state.selectedUnits[0]) return 0;

  const unit = state.selectedUnits[0];
  if (!unit.owner) return null;

  const { tech, upgrades } = useProductionStore.getState();
  const t = tech[unit.owner.id].find(
    (t) => t && t.unitId === unit.id && !(t as ResearchCompleted).timeCompleted
  );
  if (t) {
    return t.icon;
  }
  const u = upgrades[unit.owner.id].find(
    (t) => t && t.unitId === unit.id && !(t as UpgradeCompleted).timeCompleted
  );
  if (u) {
    return u.icon;
  }
  return null;
};

const unitIconSelector = (state: SelectedUnits) => {
  if (!state.selectedUnits[0]) return null;

  const unit = state.selectedUnits[0];
  if (
    (unit.dat.isBuilding &&
      !unit.dat.isZerg &&
      unit.isComplete &&
      unit.queue &&
      unit.queue.units.length) ||
    (unit.dat.isZerg &&
      !unit.dat.isBuilding &&
      unit.queue &&
      unit.queue.units.length)
  ) {
    return unit.queue.units[0];
  }

  if (unit.isComplete && unit.remainingTrainTime) {
    if (unit.typeId === unitTypes.reaver) {
      return unitTypes.scarab;
    } else if (unit.typeId === unitTypes.carrier) {
      return unitTypes.interceptor;
    } else if (unit.typeId === unitTypes.nuclearSilo) {
      return unitTypes.nuclearMissile;
    }
  }

  return null;
};

const selector = (state: SelectedUnits) => {
  const unitIcon = unitIconSelector(state);
  return unitIcon !== null ? unitIcon : researchIconSelector(state);
};

const Queue = ({ unit }: Props) => {
  const cmdIcons = useGameStore((state) => state?.assets?.icons.cmdIcons);
  if (!cmdIcons) {
    throw new AssetsMissingError("cmdIcons");
  }
  const itemRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const setDom = (icon: number | null) => {
    if (!itemRef.current || !wrapperRef.current) {
      return;
    }

    if (icon === null) {
      wrapperRef.current.style.display = "none";
      return;
    }

    wrapperRef.current.style.display = "flex";
    itemRef.current.src = cmdIcons[icon];
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: [unit] }));

    return useUnitSelectionStore.subscribe(
      (units) => {
        setDom(units);
      },
      selector,
      shallow
    );
  }, [unit]);

  return (
    <div ref={wrapperRef} className="hidden">
      <img
        ref={itemRef}
        className="border-2 rounded "
        style={{
          width: "48px",
          height: "48px",
          filter: "hue-rotate(69deg) brightness(5)",
          borderColor: "#111",
        }}
      />
    </div>
  );
};
export default Queue;
