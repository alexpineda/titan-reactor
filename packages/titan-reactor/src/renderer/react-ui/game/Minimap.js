import React, { useEffect, useRef } from "react";
import shallow from "zustand/shallow";
import omitChars from "titan-reactor-shared/utils/omitChars";
import WrappedElement from "../WrappedElement";
import useSettingsStore from "../../stores/settingsStore";
import useGameStore from "../../stores/gameStore";
import useHudStore from "../../stores/hudStore";
import useLoadingStore from "../../stores/loadingStore";
import useResourcesStore from "../../stores/realtime/resourcesStore";

const Minimap = ({ className = "" }) => {
  const textSize = useSettingsStore((state) => state.data.textSize);
  const classicClock = useSettingsStore((state) => state.data.classicClock);
  const timeRef = useRef();
  const classicTimeRef = useRef();

  useEffect(() => {
    return useResourcesStore.subscribe(
      (time) => {
        if (timeRef.current) {
          timeRef.current.textContent = time;
        }
        if (classicTimeRef.current) {
          classicTimeRef.current.textContent = time;
        }
      },
      (state) => state.time
    );
  });

  const { fogOfWar, toggleFogOfWar, minimapSize, canvas } = useGameStore(
    (state) => ({
      fogOfWar: state.fogOfWar,
      toggleFogOfWar: state.toggleFogOfWar,
      minimapSize: state.dimensions.minimapSize,
      canvas: state.game.minimapSurface.canvas,
    }),
    shallow
  );

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
      {classicClock && (
        <div
          className="text-gray-300 font-bold text-lg text-center relative"
          style={{ maxWidth: `${minimapSize}px` }}
        >
          <div
            className="absolute top-0 bottom-0 left-0 bevel-gray-800-reverse w-1/2"
            style={{ zIndex: -1 }}
          >
            &nbsp;
          </div>
          <div
            className="absolute top-0 bottom-0 right-0 bevel-gray-800 w-1/2"
            style={{ zIndex: -1 }}
          >
            &nbsp;
          </div>
          <p className="inline" ref={classicTimeRef}></p>
        </div>
      )}
      {!classicClock && (
        <>
          <div
            className="text-gray-300 bg-gray-800 font-bold text-lg  pl-1 bevel-gray-800 pb-1"
            style={{ width: "13rem", maxWidth: `${minimapSize}px` }}
          >
            <p className="inline" ref={timeRef}></p>
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
        </>
      )}
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
