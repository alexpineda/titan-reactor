import React from "react";
import shallow from "zustand/shallow";
import useHudStore from "../../stores/hudStore";
import useGameStore from "../../stores/gameStore";
import UnitsDetail from "./unitDetails/UnitsDetail";
import WrappedElement from "../WrappedElement";

const UnitSelection = ({ textSize, className = "" }) => {
  const {
    selectedUnits,
    followUnit,
    toggleFollowUnit,
    managedDomElements,
  } = useGameStore(
    (state) => ({
      selectedUnits: state.selectedUnits,
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

  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";
  return (
    <div
      className={`details flex self-end select-none ${className}`}
      style={{ width: "24vw" }}
    >
      <div
        className="rounded mb-2 p-2 flex flex-1 border-2 border-yellow-900"
        style={{ backgroundColor: "#1a202c99" }}
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

        <aside className="flex flex-col space-y-2 ml-2">
          <i
            onClick={(evt) => {
              evt.nativeEvent.stopImmediatePropagation();
              selectedUnits.length === 1 && toggleUnitDetails();
            }}
            className={`material-icons rounded cursor-pointer ${
              selectedUnits.length === 1 ? "text-blue-700" : "text-gray-700"
            }`}
            style={{ fontSize: smallIconFontSize }}
            data-tip="Unit Information"
          >
            help
          </i>
          <i
            onClick={() => toggleAttackDetails()}
            className="material-icons rounded cursor-pointer hover:text-yellow-500"
            style={{ fontSize: smallIconFontSize }}
            data-tip={`Show Attack Details`}
          >
            highlight
          </i>

          {/* <i
            onClick={() => toggleFollowUnit(units[0])}
            className={`material-icons rounded cursor-pointer hover:text-yellow-500 ${
              followUnit ? "text-yellow-700" : "text-gray-700"
            } `}
            style={{ fontSize: smallIconFontSize, marginTop: "auto" }}
            data-tip="Follow Unit"
          >
            gps_fixed
          </i> */}

          {/* <i
            onClick={() => onUnitFPV && onUnitFPV()}
            className="material-icons rounded cursor-pointer hover:text-yellow-500"
            style={{ fontSize: smallIconFontSize }}
            data-tip={`Unit First Person View`}
          >
            slideshow
          </i> */}
        </aside>
      </div>
    </div>
  );
};

export default UnitSelection;
