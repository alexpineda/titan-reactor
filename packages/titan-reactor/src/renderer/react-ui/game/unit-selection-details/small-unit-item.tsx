import React, { useEffect, useRef } from "react";
import shallow from "zustand/shallow";
import {
  useGameStore,
  GameStore,
  useUnitSelectionStore,
  UnitSelectionStore,
} from "../../../stores";
import { UnitInstance } from "../../../game";
import { UnitDAT } from "../../../../common/types";
import { AssetsMissingError } from "../../../../common/errors";

interface Props {
  unit: UnitInstance;
  index: number;
  showLoaded: boolean;
}
const filters = [
  "grayscale(1) brightness(2)",
  "brightness(2)",
  "hue-rotate(50deg)   brightness(3)",
  "hue-rotate(66deg)   brightness(5)",
  "hue-rotate(91deg)   brightness(4)",
];

const calcStep = (unit: UnitInstance) =>
  unit.canSelect
    ? Math.ceil(Math.min(1, unit.hp / (unit.dat.hp * 0.8)) * 3)
    : 0;

const iconsSelector = (state: GameStore) => state?.assets?.icons.cmdIcons;

const SmallUnitItem = ({ index, unit, showLoaded }: Props) => {
  const cmdIcons = useGameStore(iconsSelector);
  if (!cmdIcons) {
    throw new AssetsMissingError("cmdIcons");
  }
  const imgRef = useRef();
  const borderRef = useRef();

  const getUnit = (state: UnitSelectionStore) => {
    if (showLoaded) {
      return unit.loaded ? unit.loaded[index] : null;
    }

    return state.selectedUnits[index];
  };

  const selector = (state: UnitSelectionStore) => {
    const unit = getUnit(state);
    if (!unit) return { unitType: null, step: 0, canSelect: false };

    return {
      unitType: unit.dat,
      step: calcStep(unit),
      canSelect: unit.canSelect,
    };
  };

  const setDom = (
    {
      unitType,
      step,
      canSelect,
    }: { unitType: UnitDAT | null; step: number; canSelect: boolean },
    transition = ""
  ) => {
    if (!imgRef.current || !borderRef.current) {
      return;
    }

    const trans = transition || "filter 1s linear";

    if (unitType !== null && canSelect) {
      imgRef.current.src = cmdIcons[unitType.index];
      imgRef.current.style.display = "block";
      imgRef.current.style.filter = filters[step];
      imgRef.current.style.transition = trans;
      if (unit.owner) {
        borderRef.current.style.borderColor = unit.owner.color.hex;
      } else {
        borderRef.current.style.borderColor = "";
      }
      if (showLoaded && unitType.spaceRequired > 1) {
        imgRef.current.classList.add("h-16");
        if (unitType.spaceRequired === 2) {
          borderRef.current.style.gridRowStart = "span 2";
          borderRef.current.style.gridColumnStart = "auto";
        } else if (unitType.spaceRequired === 4) {
          borderRef.current.style.gridRowStart = "span 2";
          borderRef.current.style.gridColumnStart = "span 2";
        }
      } else {
        borderRef.current.style.gridRowStart = "auto";
        borderRef.current.style.gridColumnStart = "auto";
        imgRef.current.classList.remove("h-16");
      }
    } else if (unitType !== null && !showLoaded) {
      borderRef.current.style.borderColor = "";
    } else {
      imgRef.current.style.display = "none";
      borderRef.current.style.borderColor = showLoaded ? "transparent" : "";
    }
  };

  useEffect(() => {
    const selectedUnits = [];
    selectedUnits[index] = unit;
    setDom(selector({ selectedUnits }), "filter 0s linear");

    return useUnitSelectionStore.subscribe(
      (data) => {
        setDom(data);
      },
      selector,
      shallow
    );
  }, [unit, index]);

  return (
    <div
      ref={borderRef}
      className="pointer-events-auto cursor-pointer relative border border-gray-700 rounded flex items-center justify-center"
      style={{ transition: "border 300ms linear" }}
    >
      <img
        ref={imgRef}
        onClick={(evt) => {
          const unit = getUnit(useUnitSelectionStore.getState());
          if (evt.ctrlKey) {
            unit && useGameStore.getState().selectOfType(unit.dat);
          } else {
            unit && useGameStore.getState().setSelectedUnits([unit]);
          }
        }}
      />
    </div>
  );
};
export default SmallUnitItem;
