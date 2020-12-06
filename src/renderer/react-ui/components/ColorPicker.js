"use strict";

import React, { useState } from "react";
import { SwatchesPicker } from "react-color";

const ColorPicker = ({ color, onChange, className = "" }) => {
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
            onClick={() => setDisplayColorPicker(false)}
          />
          <SwatchesPicker
            color={color}
            onChangeComplete={(color) => {
              onChange(color);
              setDisplayColorPicker(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ColorPicker;
