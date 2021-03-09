import React, { useState } from "react";
import { Color } from "three";
import { isEmpty } from "ramda";
import shallow from "zustand/shallow";
import {
  incFontSize,
  decFontSize,
} from "titan-reactor-shared/utils/changeFontSize";
import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import WrappedElement from "../WrappedElement";
import useSettingsStore from "../../stores/settingsStore";
import useGameStore from "../../stores/gameStore";
import PlayerProduction from "./PlayerProduction";

const _playerNameCache = {};

const PlayerResources = ({
  id,
  name,
  race,
  color,
  textSize,
  fitToContent = false,
  playerScoreCache,
}) => {
  const { esportsHud, enablePlayerScores } = useSettingsStore(
    (state) => ({
      esportsHud: state.data.esportsHud,
      enablePlayerScores: state.data.enablePlayerScores,
    }),
    shallow
  );

  const {
    dimensions,
    togglePlayerVision,
    playerVision,
    gameIcons,
    cmdIcons,
    raceInsetIcons,
    managedDomElements,
  } = useGameStore(
    (state) => ({
      dimensions: state.dimensions,
      togglePlayerVision: state.togglePlayerVision,
      playerVision: state.playerVision,
      gameIcons: state.game.gameIcons,
      cmdIcons: state.game.cmdIcons,
      raceInsetIcons: state.game.raceInsetIcons,
      managedDomElements: state.game.managedDomElements,
    }),
    shallow
  );

  const [isChangingName, setIsChangingName] = useState(false);
  const [playerName, setPlayerName] = useState(_playerNameCache[name] || name);
  const [tempName, setTempName] = useState(playerName);
  if (playerScoreCache[playerName] === undefined) {
    playerScoreCache[playerName] = 0;
  }
  const [score, setScore] = useState(playerScoreCache[playerName]);

  const scaledTextSize =
    dimensions.width < 1400 ? decFontSize(textSize, 1) : textSize;

  let gasIcon;
  let workerIcon;

  const showingProduction = true;

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
        backgroundPosition: dimensions.width <= 1200 ? "right" : "120% 25%",
        backgroundSize: dimensions.width <= 1200 ? "contain" : "auto",
        mixBlendMode: "color-dodge",
      }
    : {};

  const fitToContentStyle = fitToContent
    ? { width: "1%", whiteSpace: "nowrap" }
    : {};
  const fixedWidthStyle = fitToContent ? { width: "6rem" } : {};
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

  const playerNameStyle = esportsHud
    ? {
        opacity: playerVision[id] ? 1 : 0.5,
        marginRight: dimensions.width <= 1200 ? "72px" : "112px",
      }
    : {
        opacity: playerVision[id] ? 1 : 0.5,
        marginRight: "0",
      };

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
                : `text-${scaledTextSize} w-full px-1 bg-gray-700 text-gray-200 rounded`
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
              className={`text-${scaledTextSize} cursor-pointer inline-block text-white ml-3 `}
              style={playerNameStyle}
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
      {showingProduction && (
        <PlayerProduction playerId={id} backgroundColor={playerColor} />
      )}
      {!showingProduction && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <div className="flex items-center">
            <img src={gameIcons.minerals} className="inline w-3" />
            <span className={`ml-2 text-gray-200 text-${scaledTextSize}`}>
              <WrappedElement
                domElement={managedDomElements.minerals[id].domElement}
                className="inline"
              />
            </span>
          </div>
        </td>
      )}
      {!showingProduction && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <div className="flex items-center">
            <img src={gasIcon} className="inline w-3" />
            <span className={`ml-2 text-gray-200 text-${scaledTextSize}`}>
              <WrappedElement
                domElement={managedDomElements.gas[id].domElement}
                className="inline"
              />
            </span>
          </div>
        </td>
      )}

      {!showingProduction && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle, width: "4rem" }}
        >
          <div className="flex items-center">
            <img src={workerIcon} className="inline w-5" />
            <span className={`ml-2 text-gray-200 text-${scaledTextSize}`}>
              <WrappedElement
                domElement={managedDomElements.workerSupply[id].domElement}
                className="inline"
              />
            </span>
          </div>
        </td>
      )}

      {!showingProduction && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <div className="flex items-center">
            <img src={gameIcons[race]} className="inline w-4" />
            <span className={`ml-2 text-gray-200 text-${scaledTextSize}`}>
              <WrappedElement
                domElement={managedDomElements.supply[id].domElement}
                className="inline"
                style={{ whiteSpace: "nowrap" }}
              />
              {/* {Math.floor(supply / 2)} / {Math.floor(supplyMax / 2)} */}
            </span>
          </div>
        </td>
      )}
      {!showingProduction && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle, width: "8rem" }}
        >
          <span className="flex items-center">
            <span
              className="text-xs uppercase text-gray-400 ml-2"
              style={{ fontSize: "0.6rem" }}
            >
              APM&nbsp;
            </span>
            <WrappedElement
              domElement={managedDomElements.apm[id].domElement}
              className="inline text-${scaledTextSize} text-gray-200"
            />
          </span>
        </td>
      )}
    </tr>
  );
};

export default PlayerResources;
