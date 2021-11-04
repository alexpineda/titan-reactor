import React from "react";
import { useSettingsStore } from "../../../stores";
import ProductionItem from "./production-item";
import range from "../../../../common/utils/range";

const tenItems = range(0, 10);
const settingsSelector = (state) =>
  state.data.esportsHud && state.data.embedProduction;

// production bar for one player and one production type
const PlayerProduction = ({ type, color, playerId }) => {
  const largeMargin = useSettingsStore(settingsSelector);
  const className = largeMargin ? "ml-5" : "ml-1";

  return (
    <div className={`flex ${className}`}>
      {tenItems.map((i) => (
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

export default PlayerProduction;
