import React, { memo } from "react";

export const App = memo(() => (
  <>
    <div
      id="load-overlay"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0,0,0,0.9)",
        display: "flex",
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
          <canvas id="map--preview-canvas"></canvas>
          <p
            id="map-name"
            style={{
              color: "white",
              fontSize: "32px",
              fontFamily: '"Blizzard Regular", Arial, Helvetica, sans-serif',
            }}
          >
            Use the file menu to load a replay or map
          </p>
          <p
            id="map-description"
            style={{
              color: "white",
              fontSize: "12px",
              width: "100%",
              textAlign: "center",
              fontFamily: '"Blizzard Regular", Arial, Helvetica, sans-serif',
            }}
          ></p>
        </span>
      </div>
    </div>
    <div
      id="minimap"
      style={{
        position: "absolute",
        left: "0",
        bottom: "0",
        height: "300px",
        width: "300px",
      }}
    ></div>
    <canvas id="three-js"></canvas>
  </>
));
