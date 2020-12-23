import React from "react";
import WrappedElement from "./WrappedElement";

const Replay = ({ gameSurface }) => {
  return (
    <WrappedElement
      style={{
        position: "absolute",
        zIndex: "-10",
        left: `${gameSurface.left}px`,
        top: `${gameSurface.top}px`,
      }}
      domElement={gameSurface.canvas}
    />
  );
};

export default Replay;
