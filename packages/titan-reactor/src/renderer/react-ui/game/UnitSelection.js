import React from "react";
import shallow from "zustand/shallow";
import useHudStore from "../../stores/hudStore";
import useGameStore from "../../stores/gameStore";
import LargeUnitDetail from "./unit-selection-details/LargeUnitDetail";
import SmallUnitDetail from "./unit-selection-details/SmallUnitDetail";

const UnitSelection = ({ className = "" }) => {
  const selectedUnits = useGameStore((state) => state.selectedUnits, shallow);

  const { followUnit, toggleFollowUnit } = useGameStore(
    (state) => ({
      followUnit: state.followUnit,
      toggleFollowUnit: state.toggleFollowUnit,
    }),
    shallow
  );

  const { toggleUnitDetails, toggleAttackDetails } = useHudStore(
    (state) => ({
      toggleUnitDetails: state.toggleUnitDetails,
      toggleAttackDetails: state.toggleAttackDetails,
    }),
    shallow
  );

  return (
    <div
      className={`details flex self-end select-none ${className}`}
      style={{ width: "28vw" }}
    >
      <div
        className="flex flex-1 "
        style={{ backgroundColor: "rgba(18, 20, 24, 0.97)" }}
      >
        <article className="flex-1 flex items-center justify-content">
          {selectedUnits.length === 1 && (
            <LargeUnitDetail unit={selectedUnits[0]} />
          )}
          {selectedUnits.length > 1 && (
            <SmallUnitDetail units={selectedUnits} />
          )}
        </article>
      </div>
    </div>
  );
};

export default UnitSelection;
