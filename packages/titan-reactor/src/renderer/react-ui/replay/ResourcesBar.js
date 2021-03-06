import React from "react";
import { connect } from "react-redux";
import PlayerResources from "./PlayerResources";
import { setRemoteSettings } from "../../utils/settingsReducer";

const ResourcesBar = ({
  players,
  textSize,
  fitToContent,
  onTogglePlayerPov,
  gameIcons,
  cmdIcons,
  managedDomElements,
  className = "",
  style = {},
}) => {
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";

  const onTogglePlayerVision = () => {};

  return (
    <div className={`select-none ${className}`} style={style}>
      <div className="resources-parent">
        <div
          className="rounded mx-1 my-1 flex"
          style={{ backgroundColor: "#1a202ce6" }}
        >
          <table className="table-auto flex-1 ">
            <tbody>
              {players.map((player, i) => (
                <PlayerResources
                  key={player.name}
                  index={i}
                  textSize={textSize}
                  {...player}
                  onTogglePlayerVision={onTogglePlayerVision}
                  fitToContent={fitToContent}
                  gameIcons={gameIcons}
                  cmdIcons={cmdIcons}
                  managedDomElements={managedDomElements}
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

export default connect(
  (state) => {
    return {
      settings: state.settings.data,
      phrases: state.settings.phrases,
      errors: state.settings.errors,
      textSize: state.settings.data.esportsHud
        ? state.settings.data.esportsHudSize
        : state.settings.data.hudFontSize,
      esportsHud: state.settings.data.esportsHud,
    };
  },
  (dispatch) => ({
    saveSettings: (settings) => dispatch(setRemoteSettings(settings)),
  })
)(ResourcesBar);
