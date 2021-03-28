import { range } from "ramda";
import React from "react";
import ProductionItem from "./ProductionItem";

export default ({ type, color, playerId }) => {
  return (
    <div className="flex ml-6">
      {range(0, 10).map((i) => (
        <ProductionItem
          key={i}
          type={type}
          color={color}
          index={i}
          playerId={playerId}
        />
      ))}
    </div>
  );
};
