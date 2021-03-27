import React, { useEffect } from "react";
import PlayerResources from "./PlayerResources";
import useSettingsStore from "../../../stores/settingsStore";
import useGameStore from "../../../stores/gameStore";
import useHudStore from "../../../stores/hudStore";
import { incFontSize } from "titan-reactor-shared/utils/changeFontSize";
import shallow from "zustand/shallow";

const _playerScoreCache = {};

const ResourcesBar = ({ fitToContent, className = "", style = {} }) => {
  const textSize = useSettingsStore((state) =>
    state.data.esportsHud
      ? incFontSize(state.data.hudFontSize)
      : state.data.hudFontSize
  );

  const save = useSettingsStore((state) => state.save);
  const autoToggleProductionView = useSettingsStore(
    (state) => state.data.autoToggleProductionView
  );

  const productionView = useHudStore((state) => state.productionView);

  const setAutoProductionView = useHudStore(
    (state) => state.setAutoProductionView
  );
  const { players, onTogglePlayerPov } = useGameStore(
    (state) => ({
      players: state.game.players,
      onTogglePlayerPov: state.onTogglePlayerPov,
    }),
    shallow
  );

  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";

  const cacheKey = players
    .map(({ name }) => name)
    .sort()
    .join(".");
  if (!_playerScoreCache[cacheKey]) {
    _playerScoreCache[cacheKey] = {};
  }

  const setAutoToggleProductionView = () => {
    const v = !autoToggleProductionView;
    save({
      autoToggleProductionView: v,
    });
    setAutoProductionView(v);
  };

  useEffect(() => {
    setAutoProductionView(autoToggleProductionView);
  }, []);

  return (
    <div className={`select-none ${className}`} style={style}>
      <div className="resources-parent">
        {/* <div className="pointer-events-none flex flex-row-reverse">
          <span
            className={`pointer-events-auto material-icons cursor-pointer hover:text-yellow-500 mr-2 ${
              autoToggleProductionView ? "text-yellow-700" : "text-gray-700 "
            }`}
            style={{ fontSize: smallIconFontSize }}
            onClick={() => {
              setAutoToggleProductionView();
            }}
          >
            update
          </span>
        </div> */}
        <div
          className="flex"
          style={{ backgroundColor: "rgba(18, 20, 24, 0.97)" }}
        >
          <table className="table-auto flex-1 ">
            <tbody>
              {players.map((player, i) => (
                <PlayerResources
                  key={player.name}
                  index={i}
                  textSize={textSize}
                  {...player}
                  fitToContent={fitToContent}
                  playerScoreCache={_playerScoreCache}
                  productionView={productionView}
                />
              ))}
            </tbody>
          </table>

          <aside className="flex flex-col justify-around mx-2">
            <i
              onClick={() => onTogglePlayerPov(0)}
              className={`material-icons rounded cursor-pointer hover:text-yellow-500 ${
                players[0].showPov ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              data-tip={`${players[0].name} First Person`}
            >
              slideshow
            </i>
            <i
              onClick={() => onTogglePlayerPov(1)}
              className={`material-icons hover:text-yellow-500 rounded cursor-pointer ${
                players[1].showPov ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              data-tip={`${players[1].name} First Person`}
            >
              slideshow
            </i>
          </aside>
          {/* <aside className="flex flex-col justify-between ml-2 b">
            <i
              onClick={() => onTogglePlayerActions && onTogglePlayerActions(0)}
              className={`material-icons hover:text-yellow-500 rounded cursor-pointer ${
                players[0].showActions ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              title="resources"
            >
              room
            </i>

            <i
              onClick={() => onTogglePlayerActions && onTogglePlayerActions(1)}
              className={`material-icons hover:text-yellow-500 rounded cursor-pointer ${
                players[1].showActions ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              title="resources"
            >
              room
            </i>
          </aside> */}
        </div>
      </div>
    </div>
  );
};

export default ResourcesBar;
