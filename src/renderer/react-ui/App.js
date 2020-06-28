import React, { memo, useRef } from "react";

export const App = memo(() => {
  return (
    <div>
      <div id="minimap"></div>
      <canvas id="three-js"></canvas>
    </div>
  );
});
