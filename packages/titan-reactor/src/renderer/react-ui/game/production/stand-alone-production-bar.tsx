import { Player } from "common";
import React from "react";
import shallow from "zustand/shallow";
import {
  useHudStore,
  useGameStore,
  UnitProductionView,
  TechProductionView,
  UpgradesProductionView,
} from "../../../stores";
import PlayerProduction from "./player-production";

const playerRowStyle = { backgroundColor: "#1a202c99" };

const StandAloneProductionBar = () => {
  const { players, dimensions } = useGameStore(
    (state) => ({
      players: state.game.players,
      dimensions: state.dimensions,
    }),
    shallow
  );
  const productionView = useHudStore((state) => state.productionView);

  return (
    <div
      className="flex absolute select-none"
      style={{
        top: `${dimensions.top}px`,
        left: `${dimensions.left}px`,
      }}
    >
      <div className="production-parent">
        {players.map(({ id, color }: Pick<Player, "id" | "color">) => (
          <div
            key={id}
            className="rounded ml-1 mt-1 flex flex-col"
            style={playerRowStyle}
          >
            {(!productionView || productionView === UnitProductionView) && (
              <td>
                <PlayerProduction
                  type="units"
                  color={color.hex}
                  playerId={id}
                />
              </td>
            )}
            {productionView === TechProductionView && (
              <td>
                <PlayerProduction type="tech" color={color.hex} playerId={id} />
              </td>
            )}
            {productionView === UpgradesProductionView && (
              <td>
                <PlayerProduction
                  type="upgrades"
                  color={color.hex}
                  playerId={id}
                />
              </td>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StandAloneProductionBar;
