import React from "react";
import shallow from "zustand/shallow";
import useGameStore from "../../../stores/gameStore";

let _wireframeIcons;
export const setWireframeIcons = (icons) => {
  _wireframeIcons = icons;
};

const LargeUnitDetail = (unit) => {
  return <div>{unit.id}</div>;
};

const SmallUnitDetail = (unit) => {
  return <div>{unit.id}</div>;
};

export default () => {
  const { selectedUnits, followUnit, toggleFollowUnit } = useGameStore(
    (state) => ({
      selectedUnits: state.selectedUnits,
      followUnit: state.followUnit,
      toggleFollowUnit: state.toggleFollowUnit,
    }),
    shallow
  );

  return selectedUnits.length === 1 ? (
    <SingleUnitDetail unit={selectedUnits[0]} />
  ) : (
    selectedUnits.map((unit) => {
      return <div key={unit.id}>{unit.id}</div>;
    })
  );
};
