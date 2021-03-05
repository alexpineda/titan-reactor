import React, { useState } from "react";
import { connect } from "react-redux";
import { Color } from "three";
import { RollingNumber } from "./RollingNumber";
import { togglePlayerVision } from "./replayHudReducer";
import incFontSize from "titan-reactor-shared/utils/incFontSize";

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
  playerVision,
  togglePlayerVision,
  onPlayerNameChange = () => {},
  playerScore = 0,
  showScore = true,
  eSportsMode,
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

  let gasIcon;

  switch (race) {
    case "terran":
      gasIcon = gameIcons.vespeneTerran;
      break;
    case "zerg":
      gasIcon = gameIcons.vespeneZerg;
      break;
    case "protoss":
      gasIcon = gameIcons.vespeneProtoss;
      break;
  }
  const hueShift = `#${new Color()
    .setStyle(color.hex)
    .offsetHSL(0.01, 0, 0)
    .getHexString()}66`;
  const lightShift = `#${new Color()
    .setStyle(color.hex)
    .offsetHSL(0, 0, 0.1)
    .getHexString()}`;

  const gameIconBgStyle = eSportsMode
    ? {
        backgroundRepeat: "no-repeat",
        backgroundImage: `url(${gameIcons[`${race}Alpha`]})`,
        backgroundPosition: "right",
        mixBlendMode: "color-dodge",
      }
    : {};

  const fitToContentStyle = fitToContent
    ? { width: "1%", whiteSpace: "nowrap" }
    : {};
  const fixedWidthStyle = fitToContent ? { width: "6em" } : {};
  const scoreTextStyle = eSportsMode
    ? {
        fontFamily: "fantasy",
        marginTop: "-1px",
        marginBottom: "-1px",
        borderLeftWidth: "4px",
        borderLeftColor: lightShift,
      }
    : {};

  const bgGradient = eSportsMode
    ? {
        background: `linear-gradient(90deg, ${color.hex} 0%, ${hueShift} 100%)`,
      }
    : {};

  const scoreBgColor = eSportsMode ? { background: color.hex } : {};

  return (
    <tr>
      {showScore && (
        <td
          className={`${eSportsMode ? "" : "pr-2"}`}
          style={{ ...fitToContentStyle, ...scoreBgColor }}
          data-tip="Player Score"
          onMouseDown={(evt) => {
            const newScore =
              evt.button === 0 ? score + 1 : Math.max(0, score - 1);
            setScore(newScore);
            onChangeScore(newScore);
          }}
        >
          <span
            className={`${
              eSportsMode
                ? `text-${incFontSize(
                    textSize,
                    2
                  )} w-10 ml-1 bg-white text-black text-center font-bold `
                : `text-${textSize} w-full px-1 bg-gray-700 text-gray-200 rounded`
            } cursor-pointer inline-block`}
            style={scoreTextStyle}
          >
            {score}
          </span>
        </td>
      )}
      <td
        className="pr-2"
        style={{
          ...fitToContentStyle,
          ...bgGradient,
          borderRight: eSportsMode ? `4px solid ${lightShift}66` : "",
        }}
        data-tip="Toggle Fog of War"
        onMouseDown={(evt) => {
          if (evt.button === 0) {
            togglePlayerVision(id);
          } else {
            setIsChangingName(true);
            // setTempName(playerName);
          }
        }}
      >
        {!isChangingName && (
          <div style={gameIconBgStyle}>
            <span
              className={`text-${textSize} cursor-pointer inline-block font-semibold text-white ml-3 `}
              style={{
                opacity: playerVision[id] ? 1 : 0.5,
                marginRight: eSportsMode ? "112px" : "0",
              }}
            >
              <span>{playerName}</span>
            </span>
          </div>
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
      <td className="px-2" onClick={toggleWorkerCount} style={fixedWidthStyle}>
        <img src={gameIcons.minerals} className="inline w-5" />
        <span className={`text-gray-200 text-${textSize}`}>
          <RollingNumber number={minerals} />
        </span>
      </td>
      <td className="px-2" onClick={toggleWorkerCount} style={fixedWidthStyle}>
        <img src={gasIcon} className="inline w-5" />
        <span className={`text-gray-200 text-${textSize}`}>
          <RollingNumber number={gas} />
        </span>
      </td>
      {showWorkerCount && (
        <td
          className="px-2"
          onClick={toggleWorkerCount}
          style={fixedWidthStyle}
        >
          <span className={`text-gray-200 text-${textSize}`}>{workers}</span>
        </td>
      )}
      <td className="px-2 pointer-events-none" style={fixedWidthStyle}>
        <span className={`text-gray-200 text-${textSize}`}>
          {Math.floor(supply / 2)} / {Math.floor(supplyMax / 2)}
        </span>
      </td>
      <td className="px-2 pointer-events-none" style={fixedWidthStyle}>
        <span className={`text-gray-200 text-${textSize} w-10`}>
          <RollingNumber number={apm} />
        </span>
        <span className="text-xs uppercase">APM</span>
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
