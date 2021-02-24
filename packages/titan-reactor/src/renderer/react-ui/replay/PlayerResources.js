import React, { useState } from "react";
import { connect } from "react-redux";
import { RollingNumber } from "./RollingNumber";
import { togglePlayerVision } from "./replayHudReducer";

const PlayerResources = ({
  index,
  id,
  name,
  playerNameCache = {},
  minerals,
  gas,
  workers,
  supply,
  supplyMax,
  race,
  color,
  apm,
  textSize = "base",
  hideVision,
  playerVision,
  togglePlayerVision,
  onPlayerNameChange = () => {},
  playerScore = 0,
  showScore = true,
  onChangeScore = () => {},
  fitToContent = false,
  gameIcons,
}) => {
  const [showWorkerCount, setShowWorkerCount] = useState(true);
  const [score, setScore] = useState(playerScore);
  const [isChangingName, setIsChangingName] = useState(false);
  const [playerName, setPlayerName] = useState(playerNameCache[name] || name);
  const [tempName, setTempName] = useState("");
  const toggleWorkerCount = () => setShowWorkerCount(!showWorkerCount);

  let workerIcon = "https://i.imgur.com/guJEX8T.png";
  let supplyIcon = "https://i.imgur.com/ThFP93l.png";
  switch (race) {
    case "terran":
    case "zerg":
    case "protoss":
      break;
  }
  const fitToContentStyle = fitToContent
    ? { width: "1%", whiteSpace: "nowrap" }
    : {};
  const fixedWidthStyle = fitToContent ? { width: "6em" } : {};

  return (
    <tr>
      {showScore && (
        <td
          className="pr-2"
          style={fitToContentStyle}
          data-tip="Player Score"
          onMouseDown={(evt) => {
            const newScore =
              evt.button === 0 ? score + 1 : Math.max(0, score - 1);
            setScore(newScore);
            onChangeScore(newScore);
          }}
        >
          <span
            className={`text-${textSize} cursor-pointer inline-block px-1 bg-gray-700 text-gray-200 rounded w-full`}
          >
            {score}
          </span>
        </td>
      )}
      <td
        className="pr-2"
        style={fitToContentStyle}
        data-tip="Toggle Fog of War"
        onMouseDown={(evt) => {
          if (evt.button === 0) {
            togglePlayerVision(id);
          } else {
            // setIsChangingName(true);
            setTempName(playerName);
          }
        }}
      >
        {!isChangingName && (
          <span
            className={`text-${textSize} cursor-pointer`}
            style={{
              color: playerVision[index] ? color.hex : "rgb(75, 85, 99)",
              opacity: hideVision ? 0.8 : 1,
            }}
          >
            {playerName}
          </span>
        )}
        {isChangingName && (
          <input
            type="text"
            value={tempName}
            onChange={(evt) => {
              setTempName(evt.target.value);
            }}
            onKeyDown={(evt) => {
              evt.nativeEvent.stopImmediatePropagation();
              if (evt.key === "Enter") {
                setPlayerName(tempName);
                onPlayerNameChange(name, tempName);
                setIsChangingName(false);
              } else if (evt.key === "Escape") {
                setIsChangingName(false);
              }
            }}
          />
        )}
      </td>
      <td className="pr-2" onClick={toggleWorkerCount} style={fixedWidthStyle}>
        <img src="https://i.imgur.com/ram4CBj.png" className="inline w-4" />
        <span className={`text-gray-200 text-${textSize}`}>
          <RollingNumber number={minerals} />
        </span>
      </td>
      <td className="pr-2" onClick={toggleWorkerCount} style={fixedWidthStyle}>
        <img src="https://i.imgur.com/NI5ynEw.png" className="inline w-4" />
        <span className={`text-gray-200 text-${textSize}`}>
          <RollingNumber number={gas} />
        </span>
      </td>
      {showWorkerCount && (
        <td
          className="pr-2"
          onClick={toggleWorkerCount}
          style={fixedWidthStyle}
        >
          <img src={workerIcon} className="inline w-4" />
          <span className={`text-gray-200 text-${textSize}`}>{workers}</span>
        </td>
      )}
      <td className="pr-2 pointer-events-none" style={fixedWidthStyle}>
        <img src={supplyIcon} className="inline w-4" />
        <span className={`text-gray-200 text-${textSize}`}>
          {Math.floor(supply / 2)} / {Math.floor(supplyMax / 2)}
        </span>
      </td>
      <td className="pr-2 pointer-events-none" style={fixedWidthStyle}>
        <img src="https://i.imgur.com/AFgJh3V.png" className="inline w-4" />
        <span className={`text-gray-200 text-${textSize} w-10`}>
          <RollingNumber number={apm} />
        </span>
      </td>
    </tr>
  );
};

export default connect(
  (state) => ({
    playerVision: state.replay.hud.playerVision,
  }),
  (dispatch) => ({
    togglePlayerVision: (id) => dispatch(togglePlayerVision(id)),
  })
)(PlayerResources);
