import React, { useEffect, useRef } from "react";
import shallow from "zustand/shallow";
import useGameStore from "../../../stores/gameStore";
import useUnitSelectionStore from "../../../stores/realtime/unitSelectionStore";
import redXIcon from "../../css/redXIcon.png";

const filters = [
  "brightness(2)",
  "hue-rotate(50deg)   brightness(3)",
  "hue-rotate(66deg)   brightness(5)",
  "hue-rotate(91deg)   brightness(4)",
];

const calcStep = (unit) =>
  Math.floor(Math.min(1, unit.hp / (unit.unitType.hp * 0.8)) * 3);

const iconsSelector = (state) => state.game.cmdIcons;

export default ({ index, unit }) => {
  const cmdIcons = useGameStore(iconsSelector);
  const imgRef = useRef();
  const xRef = useRef();

  const selector = (state) => {
    if (!state.selectedUnits[index])
      return { unitTypeId: null, step: 0, canSelect: false };

    return {
      unitTypeId: state.selectedUnits[index].typeId,
      step: calcStep(state.selectedUnits[index]),
      canSelect: state.selectedUnits[index].canSelect,
    };
  };

  const setDom = ({ unitTypeId, step, canSelect }, transition) => {
    if (!imgRef.current || !xRef.current) {
      return;
    }

    const trans = transition || "filter 1s linear";

    if (unitTypeId !== null && canSelect) {
      imgRef.current.src = cmdIcons[unitTypeId];
      imgRef.current.style.display = "block";
      imgRef.current.style.filter = filters[step];
      imgRef.current.style.transition = trans;
      xRef.current.style.display = "none";
    } else if (unitTypeId !== null) {
      xRef.current.style.display = "block";
    } else {
      xRef.current.style.display = "none";
      imgRef.current.style.display = "none";
    }
  };

  useEffect(() => {
    setDom(selector({ selectedUnits: { [index]: unit } }), "filter 0s linear");

    return useUnitSelectionStore.subscribe(
      (data) => {
        setDom(data);
      },
      selector,
      shallow
    );
  }, [unit, index]);

  return (
    <div className="pointer-events-auto cursor-pointer w-10 h-10 relative">
      <img
        ref={xRef}
        src={redXIcon}
        style={{ opacity: "0.6" }}
        className="absolute left-0 top-0 right-0 bottom-0 z-30 hidden"
      />
      <img
        ref={imgRef}
        onClick={(evt) => {
          if (evt.ctrlKey) {
            useGameStore.getState().selectOfType(unit.unitType);
          } else {
            useGameStore.getState().setSelectedUnits([unit]);
          }
        }}
      />
    </div>
  );
};
