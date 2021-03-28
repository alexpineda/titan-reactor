import React, { useRef, useEffect } from "react";
import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import useGameStore from "../../../stores/gameStore";

const transformName = (name) => name.split(" ").slice(1).join(" ");

export default ({ unit, className = "" }) => {
  const bwDat = useGameStore((state) => state.game.bwDat);
  const nameRef = useRef();

  const getZergBuildingType = (unit) => {
    const queuedZergType =
      unit.unitType.isZerg && unit.queue && unit.queue.units.length
        ? bwDat.units[unit.queue.units[0]]
        : null;
    const queuedBuildingZergType =
      queuedZergType && unit.unitType.isBuilding ? queuedZergType : null;
    return queuedBuildingZergType || null;
  };

  const selector = (state) => {
    if (!state.selectedUnits[0]) return "";

    const zergBuildingType = getZergBuildingType(state.selectedUnits[0]);
    const name = zergBuildingType
      ? zergBuildingType.name
      : state.selectedUnits[0].unitType.name;
    if (!state.selectedUnits[0].owner) {
      return name;
    } else {
      // remove race prefix
      return transformName(name);
    }
  };

  const setDom = (name) => {
    if (!nameRef.current) return;
    nameRef.current.textContent = name;
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: [unit] }));

    return useRealtimeStore.subscribe((name) => {
      setDom(name);
    }, selector);
  }, [unit]);

  return <p ref={nameRef} className={`text-white uppercase ${className}`}></p>;
};