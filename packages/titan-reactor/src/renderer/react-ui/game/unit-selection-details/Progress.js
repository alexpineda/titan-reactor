import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import useGameStore from "../../../stores/gameStore";
import React, { useRef, useEffect } from "react";

const getDisplayText = (unit) => {
  if (!unit.owner || !unit.unitType.isBuilding || unit.isComplete) return "";
  if (unit.unitType.isTerran) {
    return "Constructing";
  } else if (unit.unitType.isZerg) {
    return "Mutating";
  } else {
    return "Warping";
  }
};

export default ({ unit }) => {
  const bwDat = useGameStore((state) => state.game.bwDat);

  const progressRef = useRef();
  const wrapperRef = useRef();

  const queuedZergType =
    unit.unitType.isZerg && unit.queue && unit.queue.units.length
      ? bwDat.units[unit.queue.units[0]]
      : null;

  const displayText = getDisplayText(unit);

  const selector = (state) => {
    if (!state.selectedUnits[0]) return 0;

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

  const setDom = (progress) => {
    if (!progressRef.current || !wrapperRef.current) return;
    if (progress === null) {
      wrapperRef.current.style.visibility = "hidden";
    } else {
      if (progress < 0 || progress > 1) {
        return;
      }

      progressRef.current.style.left = `${Math.floor(
        wrapperRef.current.offsetWidth * (1 - progress) + 2
      )}px`;

      if (progress > 0) {
        wrapperRef.current.style.visibility = "visible";
      } else {
        wrapperRef.current.style.visibility = "hidden";
      }
    }
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: [unit] }));

    return useRealtimeStore.subscribe((progress) => {
      setDom(progress);
    }, selector);
  }, [unit]);

  return (
    <>
      <p className="text-gray-300">{displayText}</p>
      <div
        ref={wrapperRef}
        className="relative mt-3"
        style={{ width: "128px", height: "0.875rem" }}
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
            willChange: "left",
          }}
        ></div>
      </div>
    </>
  );
};
