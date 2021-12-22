import React, { useEffect, useRef } from "react";
import { UnitInstance } from "../../../game";

import {
  useGameStore,
  useUnitSelectionStore,
  UnitSelectionStore,
} from "../../../stores";

interface Props {
  unit: UnitInstance;
}
const selector = (state: UnitSelectionStore) => {
  if (!state.selectedUnits[0]) return "";
  return Math.floor(state.selectedUnits[0].energy / 2) * 2;
};

const Energy = ({ unit }: Props) => {
  const gameIcons = useGameStore((state) => state?.assets?.icons.gameIcons);
  const energyRef = useRef<HTMLParagraphElement>(null);

  const setDom = (energy: number | string) => {
    if (!energyRef.current) return;
    energyRef.current.textContent = String(energy);
  };

  useEffect(() => {
    setDom(unit.energy);

    return useUnitSelectionStore.subscribe((energy) => {
      setDom(energy);
    }, selector);
  }, [unit]);

  return (
    <span className="flex items-center">
      <img className="inline w-4 mr-1" src={gameIcons?.energy} />
      <p ref={energyRef} className="text-gray-300 inline"></p>
    </span>
  );
};
export default Energy;
