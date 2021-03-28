import React, { useRef, useEffect } from "react";
import { range } from "ramda";
import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import useGameStore from "../../../stores/gameStore";
import shallow from "zustand/shallow";

const blank64 =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default ({ unit }) => {
  const bwDat = useGameStore((state) => state.game.bwDat);
  const cmdIcons = useGameStore((state) => state.game.cmdIcons);
  const itemsRef = range(0, 5).map(() => useRef());
  const wrapperRef = useRef();

  const selector = (state) => {
    if (!state.selectedUnits[0]) return null;

    const unit = state.selectedUnits[0];
    if (
      (unit.unitType.isBuilding &&
        !unit.unitType.isZerg &&
        unit.unitType.producesUnits &&
        unit.isComplete &&
        unit.queue &&
        unit.queue.units.length) ||
      (unit.unitType.isZerg &&
        !unit.unitType.isBuilding &&
        unit.queue &&
        unit.queue.units.length)
    ) {
      return unit.queue.units;
    }

    return null;
  };

  const setDom = (units) => {
    if (itemsRef.some(({ current }) => !current) || !wrapperRef.current) {
      return;
    }

    if (units === null) {
      wrapperRef.current.style.display = "none";
      return;
    }

    wrapperRef.current.style.display = "flex";
    const unitType = bwDat.units[units[0]];

    for (let i = 0; i < 5; i++) {
      if (units[i] !== undefined) {
        itemsRef[i].current.classList.add("border");
        itemsRef[i].current.src = cmdIcons[units[i]];
      } else {
        if (unitType.isZerg) {
          itemsRef[i].current.classList.remove("border");
        } else {
          itemsRef[i].current.classList.add("border");
        }
        itemsRef[i].current.src = blank64;
      }
    }
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: [unit] }));

    return useRealtimeStore.subscribe(
      (units) => {
        setDom(units);
      },
      selector,
      shallow
    );
  }, [unit]);

  return (
    <div
      ref={wrapperRef}
      className="flex items-end w-full"
      style={{ height: "48px" }}
    >
      {itemsRef.map((ref, i) => {
        const style =
          i === 0
            ? {
                width: "40px",
                height: "40px",
              }
            : {
                width: "32px",
                height: "32px",
                display: "none",
              };

        style.filter = "hue-rotate(68deg) brightness(5)";

        const blankSlot = unit.unitType.isZerg && i > 0;
        const border = blankSlot ? "" : "border";
        const margin = i < 4 ? "mr-1" : "";

        let icon =
          unit.queue && unit.queue.units[i]
            ? cmdIcons[unit.queue.units[i]]
            : blank64;
        icon = blankSlot ? blank64 : icon;

        return (
          <img
            key={i}
            ref={ref}
            className={`rounded ${border} border-gray-600 ${margin}`}
            style={style}
            src={icon}
          />
        );
      })}
    </div>
  );
};
