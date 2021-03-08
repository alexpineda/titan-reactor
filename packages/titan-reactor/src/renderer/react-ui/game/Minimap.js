import React from "react";
import { connect } from "react-redux";
import omitChars from "titan-reactor-shared/utils/omitChars";
import WrappedElement from "../WrappedElement";
import { toggleFogOfWar } from "./replayHudReducer";
import { hoveringOverMinimap } from "../../input/inputReducer";

const Minimap = ({
  className = "",
  timeLabel,
  mapLabel,
  maxLabelWidth,
  textSize,
  canvas,
  showFogOfWar,
  toggleFogOfWar,
  hoveringOverMinimap,
}) => {
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";
  return (
    <div
      className={`minimap-parent flex flex-col select-none ${className}`}
      onMouseEnter={() => {
        hoveringOverMinimap(true);
      }}
      onMouseLeave={() => {
        hoveringOverMinimap(false);
      }}
    >
      <p
        className="text-gray-300 bg-gray-800 font-bold text-lg  pl-1 bevel-gray-800 pb-1"
        style={{ width: "13rem", maxWidth: `${maxLabelWidth}px` }}
      >
        <WrappedElement domElement={timeLabel} className="inline" />
      </p>

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
            showFogOfWar
              ? "text-gray-600 hover:text-yellow-600"
              : "text-yellow-600 hover:text-gray-600"
          }  `}
          style={{ fontSize: smallIconFontSize, bottom: "2px" }}
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

export default connect(
  (state) => ({
    textSize: state.settings.data.textSize,
    showFogOfWar: state.replay.hud.showFogOfWar,
    maxLabelWidth: state.replay.camera.dimensions.maxLabelWidth,
  }),
  (dispatch) => ({
    toggleFogOfWar: () => dispatch(toggleFogOfWar()),
    hoveringOverMinimap: (val) => dispatch(hoveringOverMinimap(val)),
  })
)(Minimap);
