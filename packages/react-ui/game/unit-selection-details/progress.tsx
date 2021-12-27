import React, { useRef, useEffect, forwardRef } from "react";
import shallow from "zustand/shallow";
import {
  useUnitSelectionStore,
  UnitSelectionStore,
  useProductionStore,
  useGameStore,
  GameStore,
} from "../../../stores";
import { ResearchCompleted, UpgradeCompleted } from "../../../../common/types";
import { AssetsMissingError } from "../../../../common/errors";
import { Unit } from "../../../core";

interface Props {
  unit: Unit;
}

type SelectedUnits = Pick<UnitSelectionStore, "selectedUnits">;

const getDisplayText = (unit: Unit) => {
  if (!unit.owner || !unit.dat.isBuilding) {
    return "";
  }
  if (unit.isComplete || unit.remainingTrainTime) {
    if (
      unit.isComplete &&
      unit.remainingTrainTime &&
      unit.dat.isTerran &&
      !unit.queue &&
      !unit.dat.isAddon
    ) {
      return "Adding On";
    }
    return "";
  }
  if (unit.dat.isTerran) {
    return "Constructing";
  } else if (unit.dat.isZerg) {
    return "Mutating";
  } else {
    return "Warping";
  }
};

const displayTextSelector = (state: SelectedUnits) => {
  if (!state.selectedUnits[0]) return "";
  return getDisplayText(state.selectedUnits[0]);
};

const researchSelector = (state: SelectedUnits) => {
  if (!state.selectedUnits[0]) return 0;

  const unit = state.selectedUnits[0];
  if (!unit.owner) return 0;

  const { tech, upgrades } = useProductionStore.getState();
  const t = tech[unit.owner.id].find(
    (t) => t && t.unitId === unit.id && !(t as ResearchCompleted).timeCompleted
  );
  if (t) {
    return t.remainingBuildTime / t.buildTime;
  }
  const u = upgrades[unit.owner.id].find(
    (t) => t && t.unitId === unit.id && !(t as UpgradeCompleted).timeCompleted
  );
  if (u) {
    return u.remainingBuildTime / u.buildTime;
  }
  return 0;
};

const bwDatSelector = (state: GameStore) => state?.assets?.bwDat;

const Progress = forwardRef<HTMLDivElement, Props>(({ unit }, ref) => {
  const bwDat = useGameStore(bwDatSelector);
  if (!bwDat) {
    throw new AssetsMissingError("bwDat");
  }

  const progressRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const displayTextRef = useRef<HTMLParagraphElement>(null);

  const queuedZergType =
    unit.dat.isZerg && unit.queue && unit.queue.units.length
      ? bwDat.units[unit.queue.units[0]]
      : null;

  const progressSelector = (state: SelectedUnits) => {
    if (!state.selectedUnits[0]) return 0;

    const unit = state.selectedUnits[0];

    if (unit.remainingBuildTime > 0 && unit.owner) {
      return (
        unit.remainingBuildTime /
        (queuedZergType ? queuedZergType.buildTime : unit.dat.buildTime)
      );
    } else if (unit.remainingTrainTime > 0) {
      return unit.remainingTrainTime / 255;
    } else {
      return 0;
    }
  };

  const selector = (state: SelectedUnits): [number, string] => {
    return [
      progressSelector(state) || researchSelector(state),
      displayTextSelector(state),
    ];
  };

  const setDom = ([progress, text]: [number, string]) => {
    if (!progressRef.current || !wrapperRef.current || !displayTextRef.current)
      return;
    if (progress > 0 && progress <= 1) {
      progressRef.current.style.transformOrigin = "top right";

      progressRef.current.style.transform = `scaleX(${progress})`;
      wrapperRef.current.style.visibility = "visible";
      displayTextRef.current.textContent = text;
    } else {
      displayTextRef.current.textContent = "";
      wrapperRef.current.style.visibility = "hidden";
    }
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: [unit] }));

    return useUnitSelectionStore.subscribe(
      (progress) => {
        setDom(progress);
      },
      selector,
      shallow
    );
  }, [unit]);

  return (
    <div ref={ref}>
      <p ref={displayTextRef} className="text-gray-300"></p>
      <div
        ref={wrapperRef}
        className="relative mt-3"
        style={{ width: "128px", height: "0.875rem", visibility: "hidden" }}
      >
        <div
          className="rounded-lg border-2 hp-bar absolute top-0 left-0 right-0 bottom-0"
          style={{
            borderColor: "#00ee00",
            backgroundImage:
              "linear-gradient(to right, #000000, #000000 2px, #00ee00 2px, #00ee00 )",
            backgroundSize: "7px 100%",
          }}
        ></div>
        <div
          className="border-2 rounded border-black absolute z-10"
          style={{ left: "2px", top: "2px", right: "2px", bottom: "2px" }}
        ></div>
        <div
          ref={progressRef}
          className="bg-black rounded absolute z-20"
          style={{
            left: "2px",
            top: "2px",
            right: "2px",
            bottom: "2px",
          }}
        ></div>
      </div>
    </div>
  );
});
export default Progress;
