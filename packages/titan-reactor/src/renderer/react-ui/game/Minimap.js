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
    maxLabelWidth,
    timeLabel,
    canvas,
  } = useGameStore((state) => ({
    fogOfWar: state.fogOfWar,
    toggleFogOfWar: state.toggleFogOfWar,
    maxLabelWidth: state.game.minimapSurface.width,
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
        style={{ width: "13rem", maxWidth: `${maxLabelWidth}px` }}
      >
        <WrappedElement domElement={timeLabel} className="inline" />
      </div>

      <span className="flex" style={{ maxWidth: `${maxLabelWidth}px` }}>
        <span className="bg-gray-700 text-gray-400 px-1 uppercase overflow-ellipsis flex-grow">
          <p
            style={{
              opacity: "0.8",
              whiteSpace: "nowrap",
              maxWidth: `${maxLabelWidth - 30}px`,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {omitChars(mapLabel)}
          </p>
        </span>
        <span className="bevel-gray-700 w-6 h-6"></span>
      </span>
      <div className="mb-2 flex flex-1">
        <i
          className={`material-icons rounded absolute ${
            fogOfWar
              ? "text-gray-600 hover:text-yellow-600"
              : "text-yellow-600 hover:text-gray-600"
          }  `}
          style={{ fontSize: smallIconFontSize, bottom: "10px", left: "10px" }}
          title={"Reveal Entire Map"}
          data-tip={"Reveal Entire Map"}
          onClick={toggleFogOfWar}
        >
          filter_hdr
        </i>
        <WrappedElement domElement={canvas} />
      </div>
    </div>
  );
};

export default Minimap;
