import React, { useEffect, useRef } from "react";
import { Unit } from "../../../core";
import { useUnitSelectionStore, UnitSelectionStore } from "../../../stores";

interface Props {
  unit: Unit;
}
const healthColorRed = "#d60000";
const healthColorYellow = "#aaaa00";
const healthColorGreen = "#00cc00";

const hpSelector = (state: UnitSelectionStore) => {
  if (!state.selectedUnits[0]) return 0;
  return state.selectedUnits[0].hp;
};

const Health = ({ unit }: Props) => {
  const hpRef = useRef<HTMLParagraphElement>(null);

  const setDom = (hp: number, transition = "color 4s linear") => {
    if (!hpRef.current) return;

    const healthPct = hp / unit.dat.hp;
    let hpColor = healthColorRed;
    if (healthPct > 0.66) {
      hpColor = healthColorGreen;
    } else if (healthPct > 0.33) {
      hpColor = healthColorYellow;
    }
    hpRef.current.textContent = `${hp}/${unit.dat.hp}`;
    hpRef.current.style.color = hpColor;
    hpRef.current.style.transition = transition;
  };

  useEffect(() => {
    setDom(unit.hp, "color 0s linear");
    return useUnitSelectionStore.subscribe((hp) => {
      setDom(hp);
    }, hpSelector);
  }, [unit]);

  return <p ref={hpRef} style={{ willChange: "content" }}></p>;
};
export default Health;
