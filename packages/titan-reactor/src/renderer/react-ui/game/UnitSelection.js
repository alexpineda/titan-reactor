import React from "react";
import shallow from "zustand/shallow";
import useHudStore from "../../stores/hudStore";
import useGameStore from "../../stores/gameStore";
import WrappedElement from "../WrappedElement";

const UnitSelection = ({ textSize, className = "" }) => {
  const selectedUnits = useGameStore((state) => state.selectedUnits);
  const { followUnit, toggleFollowUnit, managedDomElements } = useGameStore(
    (state) => ({
      followUnit: state.followUnit,
      toggleFollowUnit: state.toggleFollowUnit,
      managedDomElements: state.game.managedDomElements,
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
      style={{ width: "300px" }}
    >
      <div
        className="rounded px-3 pt-5 flex flex-1 "
        style={{ backgroundColor: "#1a202ce6" }}
      >
        <article className="flex-1 h-64">
          {selectedUnits.length === 1 ? (
            <WrappedElement
              domElement={managedDomElements.unitDetail.domElement}
            />
          ) : (
            <WrappedElement
              domElement={managedDomElements.unitDetails.domElement}
            />
          )}
        </article>
      </div>
    </div>
  );
};

export default UnitSelection;
