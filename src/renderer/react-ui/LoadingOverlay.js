import React, { useRef, useEffect } from "react";

const MapPreviewCanvas = ({ preview }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    preview(canvasRef.current);
  }, [preview]);
  return <canvas id="map--preview-canvas" ref={canvasRef}></canvas>;
};

export const LoadingOverlay = ({
  state = "",
  mapName = "",
  description = "",
  preview,
}) => {
  return (
    <div
      id="load-overlay"
      style={{
        position: "absolute",
        left: "0",
        top: "0",
        right: "0",
        bottom: "0",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.9)",
        display: state ? "flex" : "none",
      }}
    >
      <div id="map-preview">
        <span
          className="graphic"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            filter: "brightness(2) contract(1.2)",
          }}
        >
          {state === "loading" && <MapPreviewCanvas preview={preview} />}
          <p
            id="map-name"
            style={{
              color: "white",
              fontSize: "32px",
              // fontFamily: '"Blizzard Regular", Arial, Helvetica, sans-serif',
            }}
          >
            {mapName}
            {state === "bootup" && "Use the file menu to load a replay or map"}
          </p>
          <p
            id="map-description"
            style={{
              color: "white",
              fontSize: "12px",
              width: "100%",
              textAlign: "center",
              // fontFamily: '"Blizzard Regular", Arial, Helvetica, sans-serif',
            }}
          >
            {description}
          </p>
        </span>
      </div>
    </div>
  );
};
