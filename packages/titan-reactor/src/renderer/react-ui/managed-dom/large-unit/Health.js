import React, { useRef, useEffect } from "react";
import useRealtimeStore from "../../../stores/realtimeStore";

const healthColorRed = "#d60000";
const healthColorYellow = "#aaaa00";
const healthColorGreen = "#00cc00";

const hpSelector = (state) => {
  if (!state.selectedUnits[0]) return 0;
  return state.selectedUnits[0].hp;
};

export default ({ unit }) => {
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
    return useRealtimeStore.subscribe((hp) => {
      setDom(hp);
    }, hpSelector);
  }, [unit]);

  return <p ref={hpRef}></p>;
};
