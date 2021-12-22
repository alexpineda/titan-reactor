import React, { useEffect, useRef } from "react";
import { UnitInstance } from "../../../game";

import { useUnitSelectionStore, UnitSelectionStore } from "../../../stores";

const shieldsSelector = (state: UnitSelectionStore) => {
  if (!state.selectedUnits[0]) return 0;
  return state.selectedUnits[0].shields;
};

interface Props {
  unit: UnitInstance;
}
const Shields = ({ unit }: Props) => {
  const shieldsRef = useRef<HTMLParagraphElement>(null);

  const setDom = (shields: number) => {
    if (!shieldsRef.current) return;
    shieldsRef.current.textContent = `${shields}/${unit.dat.shields}`;
  };

  useEffect(() => {
    setDom(unit.shields);

    return useUnitSelectionStore.subscribe((shields) => {
      setDom(shields);
    }, shieldsSelector);
  }, [unit]);

  return <p ref={shieldsRef} className="text-gray-400"></p>;
};
export default Shields;
