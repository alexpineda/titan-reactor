import React, { useEffect, useRef } from "react";

import { unitTypes } from "../../../../common/bwdat/enums";
import { useUnitSelectionStore } from "../../../stores";

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

    return useUnitSelectionStore.subscribe((kills) => {
      setDom(kills);
    }, selector);
  }, [unit]);

  return <p ref={killsRef} className="text-gray-400"></p>;
};

export default Kills;
