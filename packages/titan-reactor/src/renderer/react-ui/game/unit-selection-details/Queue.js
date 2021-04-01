import React, { useRef, useEffect } from "react";
import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import useGameStore from "../../../stores/gameStore";
import shallow from "zustand/shallow";
import useProductionStore from "../../../stores/realtime/productionStore";
import { unitTypes } from "titan-reactor-shared/types/unitTypes";

const blank64 =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const researchIconSelector = (state) => {
  if (!state.selectedUnits[0]) return 0;

  const unit = state.selectedUnits[0];
  if (!unit.owner) return null;

  const { tech, upgrades } = useProductionStore.getState();
  const t = tech[unit.owner.id].find(
    (t) => t && t.unitId === unit.id && !t.timeCompleted
  );
  if (t) {
    return t.icon;
  }
  const u = upgrades[unit.owner.id].find(
    (t) => t && t.unitId === unit.id && !t.timeCompleted
  );
  if (u) {
    return u.icon;
  }
  return null;
};

const unitIconSelector = (state) => {
  if (!state.selectedUnits[0]) return null;

  const unit = state.selectedUnits[0];
  if (
    (unit.unitType.isBuilding &&
      !unit.unitType.isZerg &&
      unit.isComplete &&
      unit.queue &&
      unit.queue.units.length) ||
    (unit.unitType.isZerg &&
      !unit.unitType.isBuilding &&
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

const selector = (state) => {
  const unitIcon = unitIconSelector(state);
  return unitIcon !== null ? unitIcon : researchIconSelector(state);
};

export default ({ unit }) => {
  const cmdIcons = useGameStore((state) => state.game.cmdIcons);
  const itemRef = useRef();
  const wrapperRef = useRef();

  const setDom = (icon) => {
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

    return useRealtimeStore.subscribe(
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
