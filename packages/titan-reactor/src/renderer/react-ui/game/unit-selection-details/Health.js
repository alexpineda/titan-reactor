import React, { useEffect, useRef } from "react";

import { useUnitSelectionStore } from "../../../stores";

const healthColorRed = "#d60000";
const healthColorYellow = "#aaaa00";
const healthColorGreen = "#00cc00";

const hpSelector = (state) => {
  if (!state.selectedUnits[0]) return 0;
  return state.selectedUnits[0].hp;
};

const Health = ({ unit }) => {
  const hpRef = useRef();

  const setDom = (hp, transition = "color 4s linear") => {
    if (!hpRef.current) return;

    const healthPct = hp / unit.unitType.hp;
    let hpColor = healthColorRed;
    if (healthPct > 0.66) {
      hpColor = healthColorGreen;
    } else if (healthPct > 0.33) {
      hpColor = healthColorYellow;
    }
    hpRef.current.textContent = `${hp}/${unit.unitType.hp}`;
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
