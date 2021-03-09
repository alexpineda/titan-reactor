import React from "react";
import useGameStore from "../../stores/gameStore";
import useHudStore from "../../stores/hudStore";
import shallow from "zustand/shallow";

const PlayerProduction = ({ playerId, backgroundColor }) => {
  const unitsInProduction = useHudStore(
    (state) => state.production.unitsInProduction
  ).filter((u) => u.ownerId === playerId);

  const { cmdIcons } = useGameStore(
    (state) => ({
      cmdIcons: state.game.cmdIcons,
    }),
    shallow
  );

  return (
    <td>
      <div className="flex">
        {unitsInProduction.map(({ typeId, count }) => {
          return (
            <div key={typeId} className="w-10 relative">
              <img
                alt={typeId}
                src={cmdIcons[typeId]}
                style={{ mixBlendMode: "screen", filter: "brightness(1.5)" }}
              />
              {count > 1 && (
                <p
                  className="text-white absolute text-xs px-1 rounded"
                  style={{
                    bottom: 0,
                    right: 0,
                    backgroundColor,
                    opacity: 0.8,
                  }}
                >
                  {count}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </td>
  );
};

export default PlayerProduction;
