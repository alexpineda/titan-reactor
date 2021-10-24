import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import React, { useRef, useEffect } from "react";
import { unitTypes } from "../../../../common/bwdat/enums/unitTypes";

export const showKillsExtraUnits = [
  unitTypes.carrier,
  unitTypes.reaver,
  unitTypes.siegeTankTankMode,
  unitTypes.siegeTankSiegeMode,
];

const selector = (state) => {
  if (!state.selectedUnits[0]) return 0;
  return state.selectedUnits[0].kills;
};

const Kills = ({ unit }) => {
  const killsRef = useRef();

  const setDom = (kills) => {
    if (!killsRef.current) return;
    killsRef.current.textContent = `Kills: ${kills}`;
  };

  useEffect(() => {
    setDom(unit.kills);

    return useRealtimeStore.subscribe((kills) => {
      setDom(kills);
    }, selector);
  }, [unit]);

  return <p ref={killsRef} className="text-gray-400"></p>;
};

export default Kills;
