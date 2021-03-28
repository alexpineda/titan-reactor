import useRealtimeStore from "../../../stores/realtime/unitSelectionStore";
import React, { useRef, useEffect } from "react";
import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import useGameStore from "../../../stores/gameStore";

const resourceSelector = (state) => {
  if (!state.selectedUnits[0]) return "";
  return state.selectedUnits[0].resourceAmount;
};

export default ({ unit }) => {
  const gameIcons = useGameStore((state) => state.game.gameIcons);

  const resourceRef = useRef();

  let icon = gameIcons.minerals;

  if (
    ![unitTypes.mineral1, unitTypes.mineral2, unitTypes.mineral3].includes(
      unit.unitType.index
    )
  ) {
    if (unit.unitType.isZerg) {
      icon = gameIcons.vespeneZerg;
    } else if (unit.unitType.isProtoss) {
      icon = gameIcons.vespeneProtoss;
    } else {
      icon = gameIcons.vespeneTerran;
    }
  }

  const setDom = (resourceAmount) => {
    if (!resourceRef.current) return;
    resourceRef.current.textContent = resourceAmount;
  };

  useEffect(() => {
    setDom(unit.resourceAmount);

    return useRealtimeStore.subscribe((resourceAmount) => {
      setDom(resourceAmount);
    }, resourceSelector);
  }, [unit]);

  return (
    <span className="flex items-center">
      <img className="inline w-4 mr-1" src={icon} />
      <p ref={resourceRef} className="text-gray-400 inline"></p>
    </span>
  );
};
