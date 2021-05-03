import { range } from "ramda";
import React from "react";
import useSettingsStore from "../../../stores/settingsStore";
import ProductionItem from "./ProductionItem";

// production bar for one player and one production type
export default ({ type, color, playerId }) => {
  const largeMargin = useSettingsStore(
    (state) => state.data.esportsHud && state.data.embedProduction
  );
  const className = largeMargin ? "ml-5" : "ml-1";

  return (
    <div className={`flex ${className}`}>
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
