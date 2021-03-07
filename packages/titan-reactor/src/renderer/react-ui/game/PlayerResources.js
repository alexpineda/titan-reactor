import React, { useState } from "react";
import { connect } from "react-redux";
import { Color } from "three";
import { isEmpty } from "ramda";
import { togglePlayerVision } from "./replayHudReducer";
import { setRemoteSettings } from "../../utils/settingsReducer";
import incFontSize from "titan-reactor-shared/utils/incFontSize";
import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import WrappedElement from "../WrappedElement";

const _playerNameCache = {};

const PlayerResources = ({
  index,
  id,
  name,
  race,
  color,
  textSize,
  playerVision,
  togglePlayerVision,
  enablePlayerScores,
  esportsHud,
  fitToContent = false,
  managedDomElements,
  playerScoreCache,
  gameIcons,
  cmdIcons,
  raceInsetIcons,
}) => {
  const [isChangingName, setIsChangingName] = useState(false);
  const [playerName, setPlayerName] = useState(_playerNameCache[name] || name);
  const [tempName, setTempName] = useState(playerName);
  if (playerScoreCache[playerName] === undefined) {
    playerScoreCache[playerName] = 0;
  }
  const [score, setScore] = useState(playerScoreCache[playerName]);

  let gasIcon;
  let workerIcon;

  switch (race) {
    case "terran":
      gasIcon = gameIcons.vespeneTerran;
      workerIcon = cmdIcons[unitTypes.scv];
      break;
    case "zerg":
      workerIcon = cmdIcons[unitTypes.drone];
      gasIcon = gameIcons.vespeneZerg;
      break;
    case "protoss":
      workerIcon = cmdIcons[unitTypes.probe];
      gasIcon = gameIcons.vespeneProtoss;
      break;
  }

  let darken = new Color(0.1, 0.1, 0.1);
  if (new Color().setStyle(color.hex).getHSL().l > 0.6) {
    darken = new Color(0.2, 0.2, 0.2);
  }
  const playerColor = `#${new Color()
    .setStyle(color.hex)
    .sub(darken)
    .getHexString()}`;

  const hueShift = `#${new Color()
    .setStyle(playerColor)
    .offsetHSL(0.01, 0, 0)
    .getHexString()}66`;
  const lightShift = `#${new Color()
    .setStyle(playerColor)
    .offsetHSL(0, 0, 0.1)
    .getHexString()}`;

  const gameIconBgStyle = esportsHud
    ? {
        backgroundRepeat: "no-repeat",
        backgroundImage: `url(${raceInsetIcons[`${race}Alpha`]})`,
        backgroundPosition: "120% 25%",
        mixBlendMode: "color-dodge",
      }
    : {};

  const fitToContentStyle = fitToContent
    ? { width: "1%", whiteSpace: "nowrap" }
    : {};
  const fixedWidthStyle = fitToContent ? { width: "6em" } : {};
  const scoreTextStyle = esportsHud
    ? {
        fontFamily: "conthrax",
        marginTop: "-1px",
        marginBottom: "-1px",
        borderLeftWidth: "4px",
        borderLeftColor: lightShift,
      }
    : {};

  const tdTextStyle = esportsHud
    ? {
        fontFamily: "conthrax",
      }
    : {};

  const bgGradient = esportsHud
    ? {
        background: `linear-gradient(90deg, ${playerColor} 0%, ${hueShift} 100%)`,
      }
    : {};

  const scoreBgColor = esportsHud ? { background: playerColor } : {};

  return (
    <tr>
      {enablePlayerScores && (
        <td
          className={`${esportsHud ? "" : "pr-2"}`}
          style={{
            ...fitToContentStyle,
            ...scoreBgColor,
          }}
          data-tip="Player Score"
          onMouseDown={(evt) => {
            const newScore =
              evt.button === 0 ? score + 1 : Math.max(0, score - 1);
            setScore(newScore);
            playerScoreCache[playerName] = newScore;
          }}
        >
          <span
            className={`${
              esportsHud
                ? `text-${incFontSize(
                    textSize,
                    3
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
          borderRight: esportsHud ? `4px solid ${lightShift}66` : "",
        }}
        data-tip="Toggle Fog of War"
        onMouseDown={(evt) => {
          if (evt.button === 0) {
            togglePlayerVision(id);
          } else {
            setIsChangingName(true);
          }
        }}
      >
        {!isChangingName && (
          <div style={gameIconBgStyle}>
            <span
              className={`text-${textSize} cursor-pointer inline-block text-white ml-3 `}
              style={{
                opacity: playerVision[id] ? 1 : 0.5,
                marginRight: esportsHud ? "112px" : "0",
              }}
            >
              {playerName.split(" ").map((str, i) =>
                i === 0 ? (
                  <span className="font-semibold" key={i}>
                    {str}
                  </span>
                ) : (
                  <span key={i}>&nbsp;{str}</span>
                )
              )}
            </span>
          </div>
        )}
        {isChangingName && (
          <input
            autoFocus
            type="text"
            value={tempName}
            onChange={(evt) => {
              _playerNameCache[playerName] = evt.target.value;
              setTempName(evt.target.value);
            }}
            onKeyDown={(evt) => {
              evt.nativeEvent.stopImmediatePropagation();
              if (evt.key === "Enter" && !isEmpty(tempName)) {
                setPlayerName(tempName);
                setIsChangingName(false);
              } else if (evt.key === "Escape") {
                setIsChangingName(false);
              }
            }}
          />
        )}
      </td>
      <td
        className="px-2 pointer-events-none"
        style={{ ...fixedWidthStyle, ...tdTextStyle }}
      >
        <div className="flex items-center">
          <img src={gameIcons.minerals} className="inline w-5" />
          <span className={`ml-2 text-gray-200 text-${textSize}`}>
            <WrappedElement
              domElement={managedDomElements.minerals[id].domElement}
              className="inline"
            />
          </span>
        </div>
      </td>
      <td
        className="px-2 pointer-events-none"
        style={{ ...fixedWidthStyle, ...tdTextStyle }}
      >
        <div className="flex items-center">
          <img src={gasIcon} className="inline w-5" />
          <span className={`ml-2 text-gray-200 text-${textSize}`}>
            <WrappedElement
              domElement={managedDomElements.gas[id].domElement}
              className="inline"
            />
          </span>
        </div>
      </td>

      <td
        className="px-2 pointer-events-none"
        style={{ ...fixedWidthStyle, ...tdTextStyle }}
      >
        <div className="flex items-center">
          <img src={workerIcon} className="inline w-5" />
          <span className={`ml-2 text-gray-200 text-${textSize}`}>
            <WrappedElement
              domElement={managedDomElements.workerSupply[id].domElement}
              className="inline"
            />
          </span>
        </div>
      </td>

      <td
        className="px-2 pointer-events-none"
        style={{ ...fixedWidthStyle, ...tdTextStyle }}
      >
        <div className="flex items-center">
          <img src={gameIcons[race]} className="inline w-5" />
          <span className={`ml-2 text-gray-200 text-${textSize}`}>
            <WrappedElement
              domElement={managedDomElements.supply[id].domElement}
              className="inline"
            />
            {/* {Math.floor(supply / 2)} / {Math.floor(supplyMax / 2)} */}
          </span>
        </div>
      </td>
      <td
        className="px-2 pointer-events-none"
        style={{ ...fixedWidthStyle, ...tdTextStyle }}
      >
        <div className="flex items-center">
          <span className={`text-gray-200 inline-block text-${textSize}`}>
            <span className="text-xs uppercase text-gray-400 ml-2">APM</span>
            <WrappedElement
              domElement={managedDomElements.apm[id].domElement}
              className="inline"
            />
          </span>
        </div>
      </td>
    </tr>
  );
};

export default connect(
  (state) => ({
    playerVision: state.replay.hud.playerVision,
    esportsHud: state.settings.data.esportsHud,
    enablePlayerScores: state.settings.data.enablePlayerScores,
  }),
  (dispatch) => ({
    togglePlayerVision: (id) => dispatch(togglePlayerVision(id)),
    saveSettings: (settings) => dispatch(setRemoteSettings(settings)),
  })
)(PlayerResources);
