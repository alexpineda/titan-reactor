import { range } from "ramda";
import React, { useRef, useEffect } from "react";
import shallow from "zustand/shallow";
import useGameStore from "../../../stores/gameStore";
import useRealtimeStore from "../../../stores/realtimeStore";

const canSelect = (u) => u.canSelect;
const hasNonAttackers = (u) =>
  !u.unitType.isSpellcaster &&
  u.unitType.groundWeapon === 130 &&
  u.unitType.airWeapon === 130;
const sumKills = (tkills, { kills }) => tkills + kills;

const getKillCount = (units) => {
  if (units.some(hasNonAttackers)) {
    return "";
  } else {
    return `Kills: ${units.filter(canSelect).reduce(sumKills, 0)}`;
  }
};

const filters = [
  "brightness(2)",
  "hue-rotate(50deg)   brightness(3)",
  "hue-rotate(66deg)   brightness(5)",
  "hue-rotate(91deg)   brightness(4)",
];

const calcStep = (unit) =>
  Math.floor(Math.min(1, unit.hp / (unit.unitType.hp * 0.8)) * 3);

const selector = (state) => ({
  units: state.selectedUnits,
  steps: state.selectedUnits.map(calcStep),
  canSelect: state.selectedUnits.map(canSelect),
});

const comparitor = (a, b) => {
  if (
    shallow(a.units, b.units) &&
    shallow(a.steps, b.steps) &&
    shallow(a.canSelect, b.canSelect)
  ) {
    return true;
  }
  return false;
};

export default ({ units }) => {
  const cmdIcons = useGameStore((state) => state.game.cmdIcons);
  const selectedRef = range(0, 12).map(() => useRef());

  const setDom = ({ units, steps }, transition) => {
    if (selectedRef.some(({ current }) => !current)) {
      return;
    }

    const trans = transition || "filter 1s linear";

    for (let i = 0; i < 12; i++) {
      if (units[i] && units[i].canSelect) {
        selectedRef[i].current.src = cmdIcons[units[i].typeId];
        selectedRef[i].current.style.display = "flex";
        selectedRef[i].current.style.filter = filters[steps[i]];
        selectedRef[i].current.style.transition = trans;
      } else {
        selectedRef[i].current.style.display = "none";
      }
    }
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: units }), "filter 0s linear");

    return useRealtimeStore.subscribe(
      (data) => {
        setDom(data);
      },
      selector,
      comparitor
    );
  }, [units]);

  return (
    <div className="flex flex-col ">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
        }}
      >
        {selectedRef.map((ref, i) => {
          return (
            <img
              className="pointer-events-auto cursor-pointer w-8 m-1"
              key={i}
              ref={ref}
              onClick={(evt) => {
                if (evt.ctrlKey) {
                  useGameStore.getState().selectOfType(units[i].unitType);
                } else {
                  useGameStore.getState().setSelectedUnits([units[i]]);
                }
              }}
            />
          );
        })}
      </div>
      <div className="text-white">{getKillCount(units)}</div>
    </div>
  );
};
