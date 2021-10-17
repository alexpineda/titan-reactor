import useUnitSelectionStore from "../../../stores/realtime/unitSelectionStore";
import useProductionStore from "../../../stores/realtime/productionStore";
import useGameStore from "../../../stores/gameStore";
import React, { useRef, useEffect, forwardRef } from "react";
import shallow from "zustand/shallow";

const getDisplayText = (unit) => {
  if (!unit.owner || !unit.unitType.isBuilding) {
    return "";
  }
  if (unit.isComplete || unit.remainingTrainTime) {
    if (
      unit.isComplete &&
      unit.remainingTrainTime &&
      unit.unitType.isTerran &&
      !unit.queue &&
      !unit.unitType.isAddon
    ) {
      return "Adding On";
    }
    return "";
  }
  if (unit.unitType.isTerran) {
    return "Constructing";
  } else if (unit.unitType.isZerg) {
    return "Mutating";
  } else {
    return "Warping";
  }
};

const displayTextSelector = (state) => {
  if (!state.selectedUnits[0]) return "";
  return getDisplayText(state.selectedUnits[0]);
};

const researchSelector = (state) => {
  if (!state.selectedUnits[0]) return 0;

  const unit = state.selectedUnits[0];
  if (!unit.owner) return null;

  const { tech, upgrades } = useProductionStore.getState();
  const t = tech[unit.owner.id].find(
    (t) => t && t.unitId === unit.id && !t.timeCompleted
  );
  if (t) {
    return t.remainingBuildTime / t.buildTime;
  }
  const u = upgrades[unit.owner.id].find(
    (t) => t && t.unitId === unit.id && !t.timeCompleted
  );
  if (u) {
    return u.remainingBuildTime / u.buildTime;
  }
  return null;
};

const bwDatSelector = (state) => state.assets.bwDat;

const Progress = forwardRef(({ unit }, ref) => {
  const bwDat = useGameStore(bwDatSelector);

  const progressRef = useRef();
  const wrapperRef = useRef();
  const displayTextRef = useRef();

  const queuedZergType =
    unit.unitType.isZerg && unit.queue && unit.queue.units.length
      ? bwDat.units[unit.queue.units[0]]
      : null;

  const progressSelector = (state) => {
    if (!state.selectedUnits[0]) return null;

    const unit = state.selectedUnits[0];

    if (unit.remainingBuildTime > 0 && unit.owner) {
      return (
        unit.remainingBuildTime /
        (queuedZergType ? queuedZergType.buildTime : unit.unitType.buildTime)
      );
    } else if (unit.remainingTrainTime > 0) {
      return unit.remainingTrainTime / 255;
    } else {
      return null;
    }
  };

  const selector = (state) => {
    return [
      progressSelector(state) || researchSelector(state),
      displayTextSelector(state),
    ];
  };

  const setDom = ([progress, text]) => {
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
