import React, { memo } from "react";

export const App = memo(() => (
  <>
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
