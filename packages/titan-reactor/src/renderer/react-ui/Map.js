import React from "react";
import WrappedElement from "./WrappedElement";
import useGameStore from "../stores/gameStore";

const Map = () => {
  const surface = useGameStore((state) => state.game.surface);

  return (
    <WrappedElement
      style={{
        position: "absolute",
        zIndex: "-10",
        left: `${surface.left}px`,
        top: `${surface.top}px`,
      }}
      domElement={surface.canvas}
    />
  );
};

export default Map;
