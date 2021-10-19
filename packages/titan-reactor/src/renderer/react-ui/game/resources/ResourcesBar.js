import React, { useEffect, memo } from "react";
import PlayerResources from "./PlayerResources";
import shallow from "zustand/shallow";
import useSettingsStore from "../../../stores/settingsStore";
import useHudStore from "../../../stores/hudStore";
import { incFontSize } from "../../../../common/utils/changeFontSize";

const _playerScoreCache = {};
const hudStoreSelector = (state) => state.productionView;
const textSizeSelector = (state) =>
  state.data.esportsHud
    ? incFontSize(state.data.hudFontSize)
    : state.data.hudFontSize;
const toggleSelector = (state) => state.data.autoToggleProductionView;

// in gameStore onTogglePlayerPov: state.onTogglePlayerPov,

const settingsSelector = (state) => ({
  esportsHud: state.data.esportsHud,
  enablePlayerScores: state.data.enablePlayerScores,
  embedProduction: state.data.embedProduction,
});

const setAutoProductionView = useHudStore.getState().setAutoProductionView;

// wrapper for showing all participating player information (scores, names, resources, etc)
const ResourcesBar = ({ fitToContent, className, style, players }) => {
  const textSize = useSettingsStore(textSizeSelector);
  const autoToggleProductionView = useSettingsStore(toggleSelector);
  const productionView = useHudStore(hudStoreSelector);
  const { esportsHud, enablePlayerScores, embedProduction } = useSettingsStore(
    settingsSelector,
    shallow
  );
  const cacheKey = players
    .map(({ name }) => name)
    .sort()
    .join(".");
  if (!_playerScoreCache[cacheKey]) {
    _playerScoreCache[cacheKey] = {};
  }

  useEffect(() => {
    setAutoProductionView(autoToggleProductionView);
  }, []);

  return (
    <div
      className={`resources-parent flex select-none ${className}`}
      style={{ backgroundColor: "rgba(18, 20, 24)", ...style }}
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
              esportsHud={esportsHud}
              enablePlayerScores={enablePlayerScores}
              embedProduction={embedProduction}
            />
          ))}
        </tbody>
      </table>

      {/* <aside className="flex flex-col justify-around mx-2">
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
          </aside> */}
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
  );
};

ResourcesBar.defaultProps = {
  className: "",
  style: {},
};

export default memo(ResourcesBar);
