import React, { useEffect, useRef } from "react";

import { useGameStore, useUnitSelectionStore } from "../../../stores";

const selector = (state) => {
  if (!state.selectedUnits[0]) return "";
  return Math.floor(state.selectedUnits[0].energy / 2) * 2;
};

const Energy = ({ unit }) => {
  const gameIcons = useGameStore((state) => state.assets.icons.gameIcons);
  const energyRef = useRef();

  const setDom = (energy) => {
    if (!energyRef.current) return;
    energyRef.current.textContent = `${energy}`;
  };

  useEffect(() => {
    setDom(unit.energy);

    return useUnitSelectionStore.subscribe((energy) => {
      setDom(energy);
    }, selector);
  }, [unit]);

  return (
    <span className="flex items-center">
      <img className="inline w-4 mr-1" src={gameIcons.energy} />
      <p ref={energyRef} className="text-gray-300 inline"></p>
    </span>
  );
};
export default Energy;
