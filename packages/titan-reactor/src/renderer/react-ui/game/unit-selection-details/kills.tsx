import React, { useEffect, useRef } from "react";
import { UnitInstance } from "../../../game";

import { unitTypes } from "../../../../common/bwdat/enums";
import { useUnitSelectionStore, UnitSelectionStore } from "../../../stores";

export const showKillsExtraUnits = [
  unitTypes.carrier,
  unitTypes.reaver,
  unitTypes.siegeTankTankMode,
  unitTypes.siegeTankSiegeMode,
];

interface Props {
  unit: UnitInstance;
}

const selector = (state: UnitSelectionStore) => {
  if (!state.selectedUnits[0]) return 0;
  return state.selectedUnits[0].kills;
};

const Kills = ({ unit }: Props) => {
  const killsRef = useRef();

  const setDom = (kills: number) => {
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
