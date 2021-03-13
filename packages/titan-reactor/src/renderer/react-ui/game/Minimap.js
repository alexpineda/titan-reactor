import React from "react";
import omitChars from "titan-reactor-shared/utils/omitChars";
import WrappedElement from "../WrappedElement";
import useSettingsStore from "../../stores/settingsStore";
import useGameStore from "../../stores/gameStore";
import useHudStore from "../../stores/hudStore";
import useLoadingStore from "../../stores/loadingStore";

const Minimap = ({ className = "" }) => {
  const textSize = useSettingsStore((state) => state.data.textSize);

  const {
    fogOfWar,
    toggleFogOfWar,
    minimapSize,
    timeLabel,
    canvas,
  } = useGameStore((state) => ({
    fogOfWar: state.fogOfWar,
    toggleFogOfWar: state.toggleFogOfWar,
    minimapSize: state.dimensions.minimapSize,
    timeLabel: state.game.managedDomElements.timeLabel.domElement,
    canvas: state.game.minimapSurface.canvas,
  }));

  const mapLabel = useLoadingStore((state) => state.chk.title);

  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";
  return (
    <div
      className={`minimap-parent flex flex-col select-none ${className}`}
      onMouseEnter={() => {
        useHudStore.setState({ hoveringOverMinimap: true });
      }}
      onMouseLeave={() => {
        useHudStore.setState({ hoveringOverMinimap: false });
      }}
    >
      <div
        className="text-gray-300 bg-gray-800 font-bold text-lg  pl-1 bevel-gray-800 pb-1"
        style={{ width: "13rem", maxWidth: `${minimapSize}px` }}
      >
        <WrappedElement domElement={timeLabel} className="inline" />
      </div>

      <span className="flex" style={{ maxWidth: `${minimapSize}px` }}>
        <span className="bg-gray-700 text-gray-400 px-1 uppercase overflow-ellipsis flex-grow">
          <p
            style={{
              opacity: "0.8",
              whiteSpace: "nowrap",
              maxWidth: `${minimapSize - 30}px`,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {omitChars(mapLabel)}
          </p>
        </span>
        <span className="bevel-gray-700 w-6 h-6"></span>
      </span>
      <div className="mb-1 flex flex-1 relative">
        <i
          className={`material-icons rounded absolute ${
            fogOfWar
              ? "text-gray-600 hover:text-yellow-600"
              : "text-yellow-600 hover:text-gray-600"
          }  `}
          style={{ fontSize: smallIconFontSize, top: "-19px", right: "20px" }}
          title={"Reveal Entire Map"}
          data-tip={"Reveal Entire Map"}
          onClick={toggleFogOfWar}
        >
          filter_hdr
        </i>

        <WrappedElement
          domElement={canvas}
          className="bg-black  flex items-center justify-center"
          style={{ width: `${minimapSize}px`, height: `${minimapSize}px` }}
        />
      </div>
    </div>
  );
};

export default Minimap;
