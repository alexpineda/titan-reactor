import { range } from "ramda";
import React, { useRef, useEffect } from "react";
import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import SmallUnitItem from "./SmallUnitItem";

const canSelect = (u) => u.canSelect;
const hasNonAttackers = (u) =>
  !u.unitType.isSpellcaster &&
  u.unitType.groundWeapon === 130 &&
  u.unitType.airWeapon === 130;
const sumKills = (tkills, { kills }) => tkills + kills;

const selector = (state) => {
  if (state.selectedUnits.some(hasNonAttackers)) {
    return "";
  } else {
    return `Kills: ${state.selectedUnits
      .filter(canSelect)
      .reduce(sumKills, 0)}`;
  }
};

export default ({ units }) => {
  const killsRef = useRef();

  const setDom = (killsText) => {
    if (!killsRef.current) return;
    killsRef.current.textContent = killsText;
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: units }));

    return useRealtimeStore.subscribe((killsText) => {
      setDom(killsText);
    }, selector);
  }, [units]);

  return (
    <div className="flex items-center pl-1 pt-1">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridGap: ".25rem",
        }}
      >
        {range(0, 12).map((i) => (
          <SmallUnitItem key={i} index={i} unit={units[i]} />
        ))}
      </div>
      <div ref={killsRef} className="text-gray-300 p-1"></div>
    </div>
  );
};
