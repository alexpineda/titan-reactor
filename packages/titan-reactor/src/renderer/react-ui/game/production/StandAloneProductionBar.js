import React from "react";
import shallow from "zustand/shallow";
import useGameStore from "../../../stores/gameStore";
import useHudStore, {
  UnitProductionView,
  TechProductionView,
  UpgradesProductionView,
} from "../../../stores/hudStore";
import useSettingsStore from "../../../stores/settingsStore";
import PlayerProduction from "./PlayerProduction";

const Production = () => {
  const { players, dimensions } = useGameStore(
    (state) => ({
      players: state.game.players,
      dimensions: state.dimensions,
    }),
    shallow
  );
  const productionView = useHudStore((state) => state.productionView);

  // const { hudFontSize } = useSettingsStore(
  //   (state) => ({
  //     hudFontSize: state.data.hudFontSize,
  //   }),
  //   shallow
  // );

  return (
    <div
      className="flex absolute select-none"
      style={{
        top: `${dimensions.top}px`,
        left: `${dimensions.left}px`,
      }}
    >
      <div className="production-parent">
        {players.map(({ id, color }) => (
          <div
            key={id}
            className="rounded ml-1 mt-1 flex flex-col"
            style={{ backgroundColor: "#1a202c99" }}
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

// export default connect((state) => {
//   return {
//     textSize: state.settings.data.textSize,
//     settings: state.settings.data,
//     phrases: state.settings.phrases,
//     errors: state.settings.errors,
//   };
// })(Production);

export default Production;
