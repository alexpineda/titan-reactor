import React from "react";

export default ({
  units,
  textSize,
  onUnitDetails,
  onShowAttackDetails,
  onFollowUnit,
  followingUnit,
  hideUnitSelection,
}) => {
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";
  return (
    <div
      className={`details flex-1 flex self-end select-none ${
        hideUnitSelection ? "hidden" : ""
      }`}
    >
      <div
        className="rounded mb-2 p-2 flex flex-1 border-2 border-yellow-900"
        style={{ backgroundColor: "#1a202c99" }}
      >
        <article className="flex-1">Building Select</article>

        <aside className="flex flex-col space-y-2 ml-2">
          <i
            onClick={(evt) => {
              evt.nativeEvent.stopImmediatePropagation();
              onUnitDetails && units.length === 1 && onUnitDetails();
            }}
            className={`material-icons rounded cursor-pointer ${
              units.length === 1 ? "text-blue-700" : "text-gray-700"
            }`}
            style={{ fontSize: smallIconFontSize }}
            data-tip={`Unit Information`}
          >
            help
          </i>
          <i
            onClick={() => onShowAttackDetails && onShowAttackDetails()}
            className="material-icons rounded cursor-pointer hover:text-yellow-500"
            style={{ fontSize: smallIconFontSize }}
            data-tip={`Show Attack Details`}
          >
            highlight
          </i>

          <i
            onClick={() => onFollowUnit && onFollowUnit()}
            className={`material-icons rounded cursor-pointer hover:text-yellow-500 ${
              followingUnit ? "text-yellow-700" : "text-gray-700"
            } `}
            style={{ fontSize: smallIconFontSize, marginTop: "auto" }}
            data-tip={`Follow Unit`}
          >
            gps_fixed
          </i>

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
