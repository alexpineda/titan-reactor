import React from "react";
import { connect } from "react-redux";
import { togglePlayerPov } from "./cameraReducer";
import PlayerResources from "./PlayerResources";

const ResourcesBar = ({
  players,
  textSize,
  fitToContent,
  onTogglePlayerPov,
  className,
  style,
}) => {
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";

  const onTogglePlayerVision = () => {};

  return (
    <div className={`select-none ${className}`} style={style}>
      <div className="resources-parent">
        <div
          className="rounded mx-1 my-1 py-1 px-2 flex"
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
                />
              ))}
            </tbody>
          </table>

          <aside className="flex flex-col justify-around ml-2">
            <i
              onClick={() => onTogglePlayerPov && onTogglePlayerPov(0)}
              className={`material-icons rounded cursor-pointer hover:text-yellow-500 ${
                players[0].showPov ? "text-yellow-700" : "text-gray-700 "
              }`}
              style={{ fontSize: smallIconFontSize }}
              data-tip={`${players[0].name} First Person`}
            >
              slideshow
            </i>
            <i
              onClick={() => onTogglePlayerPov && onTogglePlayerPov(1)}
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
  (
    state,
    { players, textSize, fitToContent = false, className = "", style = {} }
  ) => {
    return {
      players,
      textSize,
      fitToContent,
      className,
      style,
    };
  },
  (dispatch) => ({
    onTogglePlayerPov: (player) => dispatch(togglePlayerPov(player)),
  })
)(ResourcesBar);
