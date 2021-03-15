import React, { useState } from "react";
import { isEmpty } from "ramda";
import shallow from "zustand/shallow";
import {
  incFontSize,
  decFontSize,
} from "titan-reactor-shared/utils/changeFontSize";
import WrappedElement from "../../WrappedElement";
import useSettingsStore from "../../../stores/settingsStore";
import useGameStore from "../../../stores/gameStore";
import {
  ResourcesView,
  UnitProductionView,
  TechProductionView,
  UpgradesProductionView,
} from "../../../stores/hudStore";
import Minerals from "./Minerals";
import Gas from "./Gas";
import Workers from "./Workers";
import Supply from "./Supply";
import Apm from "./Apm";

const _playerNameCache = {};

//unused first entry but still needs to be valid

const PlayerResources = ({
  id,
  name,
  race,
  color,
  textSize,
  fitToContent = false,
  playerScoreCache,
  productionView,
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
    raceInsetIcons,
    workerIcons,
    managedDomElements,
  } = useGameStore(
    (state) => ({
      dimensions: state.dimensions,
      togglePlayerVision: state.togglePlayerVision,
      playerVision: state.playerVision,
      gameIcons: state.game.gameIcons,
      raceInsetIcons: state.game.raceInsetIcons,
      workerIcons: state.game.workerIcons,
      managedDomElements: state.game.managedDomElements,
    }),
    shallow
  );

  const domElements = useGameStore((state) => state.game.managedDomElements);

  const [isChangingName, setIsChangingName] = useState(false);
  const [playerName, setPlayerName] = useState(_playerNameCache[name] || name);
  const [tempName, setTempName] = useState(playerName);
  if (playerScoreCache[playerName] === undefined) {
    playerScoreCache[playerName] = 0;
  }
  const [score, setScore] = useState(playerScoreCache[playerName]);

  const scaledTextSize =
    dimensions.width < 1500 ? decFontSize(textSize, 2) : textSize;

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

  const gameIconBgStyle = esportsHud
    ? {
        backgroundRepeat: "no-repeat",
        backgroundImage: `url(${raceInsetIcons[`${race}Alpha`]})`,
        backgroundPosition: dimensions.width <= 1200 ? "right" : "120% 25%",
        backgroundSize: dimensions.width <= 1200 ? "contain" : "auto",
        mixBlendMode: "lighten",
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
        borderLeftColor: color.alt.lightShift,
        paddingTop: "2px",
        paddingBottom: "2px",
      }
    : {};

  const tdTextStyle = esportsHud
    ? {
        fontFamily: "conthrax",
      }
    : {};

  const bgGradient = esportsHud
    ? {
        background: `linear-gradient(90deg, ${color.alt.darker} 0%, ${color.alt.hueShift} 100%)`,
      }
    : {};

  const scoreBgColor = esportsHud ? { background: color.alt.darker } : {};

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
          borderRight: esportsHud ? `4px solid ${color.alt.lightShift}66` : "",
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
      <td
        className={`${productionView !== UnitProductionView ? "hidden" : ""}`}
      >
        <WrappedElement domElement={domElements.production[id].domElement} />
      </td>
      <td
        className={`${productionView !== TechProductionView ? "hidden" : ""}`}
      >
        <WrappedElement domElement={domElements.research[id].domElement} />
      </td>
      <td
        className={`${
          productionView !== UpgradesProductionView ? "hidden" : ""
        }`}
      >
        <WrappedElement domElement={domElements.upgrades[id].domElement} />
      </td>
      {!productionView && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <div className="flex items-center">
            <Minerals image={gameIcons.minerals} dimensions={dimensions} />
            <span className={`ml-2 text-gray-200 text-${scaledTextSize}`}>
              <WrappedElement
                domElement={managedDomElements.minerals[id].domElement}
                className="inline"
              />
            </span>
          </div>
        </td>
      )}
      {!productionView && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <div className="flex items-center">
            <Gas image={gasIcon} dimensions={dimensions} />
            <span className={`ml-2 text-gray-200 text-${scaledTextSize}`}>
              <WrappedElement
                domElement={managedDomElements.gas[id].domElement}
                className="inline"
              />
            </span>
          </div>
        </td>
      )}

      {!productionView && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle, width: "4rem" }}
        >
          <div className="flex items-center">
            <Workers image={workerIcons[race]} dimensions={dimensions} />
            <span className={`ml-2 text-gray-200 text-${scaledTextSize}`}>
              <WrappedElement
                domElement={managedDomElements.workerSupply[id].domElement}
                className="inline"
              />
            </span>
          </div>
        </td>
      )}

      {!productionView && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <div className="flex items-center">
            <Supply image={gameIcons[race]} dimensions={dimensions} />
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
      {!productionView && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle, width: "5rem" }}
        >
          <span className="flex items-center">
            <Apm image={workerIcons.apm} dimensions={dimensions} />

            <WrappedElement
              domElement={managedDomElements.apm[id].domElement}
              className={`inline text-${scaledTextSize} text-gray-200 ml-2 `}
            />
          </span>
        </td>
      )}
    </tr>
  );
};

export default PlayerResources;
