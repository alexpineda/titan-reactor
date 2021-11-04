"use strict";
import React, { useState } from "react";


//add bw color swatches to
// SwatchesPicker.defaultProps.colors.unshift([
//   "#ecc4b0",
//   "#4068d4",
//   "#74a47c",
//   "#9090b8",
//   "#00e4fc",
// ]);
// SwatchesPicker.defaultProps.colors.unshift([
//   "#703014",
//   "#cce0d0",
//   "#fcfc38",
//   "#088008",
//   "#fcfc7c",
// ]);
// SwatchesPicker.defaultProps.colors.unshift([
//   "#f40404",
//   "#0c48cc",
//   "#2cb494",
//   "#88409c",
//   "#f88c14",
// ]);

export const ColorPicker = ({ color, onChange, className = "" }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  return (
    <div className={className}>
      <div
        className="rounded-sm p-4 shadow-sm cursor-pointer inline-block"
        onClick={() => setDisplayColorPicker(!displayColorPicker)}
      >
        <div
          className="h-6 w-10 rounded border border-white"
          style={{ backgroundColor: color }}
        />
      </div>
      {displayColorPicker ? (
        <div className="absolute z-10 bg-black">
          <div
            className="fixed"
            style={{ top: "0px", right: "0px", bottom: "0px", left: "0px" }}
            onClick={() => {
              onChange();
              setDisplayColorPicker(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ColorPicker;