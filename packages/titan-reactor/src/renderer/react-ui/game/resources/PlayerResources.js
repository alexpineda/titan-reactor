import React, { useState } from "react";
import { isEmpty } from "ramda";
import shallow from "zustand/shallow";
import {
  incFontSize,
  decFontSize,
} from "titan-reactor-shared/utils/changeFontSize";
import useSettingsStore from "../../../stores/settingsStore";
import useGameStore from "../../../stores/gameStore";
import {
  UnitProductionView,
  TechProductionView,
  UpgradesProductionView,
} from "../../../stores/hudStore";
import PlayerProduction from "../production/PlayerProduction";
import RollingResource from "./RollingResource";
import BasicResource from "./BasicResource";

const _playerNameCache = {};

/**
 * The primary player bar displaying player score, name, resources and production.
 */
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
  const { esportsHud, enablePlayerScores, embedProduction } = useSettingsStore(
    (state) => ({
      esportsHud: state.data.esportsHud,
      enablePlayerScores: state.data.enablePlayerScores,
      embedProduction: state.data.embedProduction,
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
  } = useGameStore(
    (state) => ({
      dimensions: state.dimensions,
      togglePlayerVision: state.togglePlayerVision,
      playerVision: state.playerVision,
      gameIcons: state.game.gameIcons,
      raceInsetIcons: state.game.raceInsetIcons,
      workerIcons: state.game.workerIcons,
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
        color: color.hex,
        opacity: playerVision[id] ? 1 : 0.5,
        marginRight: "0",
      };

  const resourcesEnabled = !esportsHud || !embedProduction || !productionView;
  const productionEnabled = esportsHud && embedProduction;

  return (
    <tr>
      {enablePlayerScores && (
        <td
          className={`${esportsHud ? "" : "px-2"} pointer-events-auto`}
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
        className="pr-2  pointer-events-auto"
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

      {productionEnabled && productionView === UnitProductionView && (
        <td>
          <PlayerProduction type="units" color={color.hex} playerId={id} />
        </td>
      )}
      {productionEnabled && productionView === TechProductionView && (
        <td>
          <PlayerProduction type="tech" color={color.hex} playerId={id} />
        </td>
      )}
      {productionEnabled && productionView === UpgradesProductionView && (
        <td>
          <PlayerProduction type="upgrades" color={color.hex} playerId={id} />
        </td>
      )}
      {resourcesEnabled && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <RollingResource
            image={
              <img
                src={gameIcons.minerals}
                className={`inline ${
                  dimensions.width < 1500 ? "w-4 w-4" : "w-6 w-6"
                }`}
                style={{
                  filter: "contrast(0.5) saturate(2) brightness(1.2)",
                  mixBlendMode: "hard-light",
                }}
              />
            }
            selector={(state) => state.minerals[id]}
            scaledTextSize={scaledTextSize}
          />
        </td>
      )}
      {resourcesEnabled && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <RollingResource
            image={
              <img
                src={gasIcon}
                className={`inline ${
                  dimensions.width < 1500 ? "w-4 w-4" : "w-6 w-6"
                }`}
                style={{
                  filter: "contrast(0.5) saturate(2) brightness(1.2)",
                  mixBlendMode: "hard-light",
                }}
              />
            }
            scaledTextSize={scaledTextSize}
            selector={(state) => state.gas[id]}
          />
        </td>
      )}

      {resourcesEnabled && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle, width: "4rem" }}
        >
          <BasicResource
            image={
              <img
                src={workerIcons[race]}
                className={`inline ${
                  dimensions.width < 1500 ? "w-6 w-6" : "w-8 h-8"
                }`}
                style={{
                  filter: "brightness(1.5)",
                  mixBlendMode: "luminosity",
                }}
              />
            }
            scaledTextSize={scaledTextSize}
            selector={(state) => state.workerSupply[id]}
          />
        </td>
      )}

      {resourcesEnabled && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle }}
        >
          <BasicResource
            image={
              <img
                src={gameIcons[race]}
                className={`inline ${
                  dimensions.width < 1500 ? "w-4 w-4" : "w-6 w-6"
                }`}
                style={{
                  filter: "grayscale(0.5) contrast(0.5) brightness(1.35)",
                  mixBlendMode: "hard-light",
                  transform: "scale(1.2)",
                }}
              />
            }
            scaledTextSize={scaledTextSize}
            selector={(state) =>
              `${state.supplyUsed[id]} / ${state.supplyAvailable[id]}`
            }
          />
        </td>
      )}
      {resourcesEnabled && (
        <td
          className="px-2 pointer-events-none"
          style={{ ...fixedWidthStyle, ...tdTextStyle, width: "5rem" }}
        >
          <RollingResource
            image={
              <img
                src={workerIcons.apm}
                className="inline"
                style={{
                  filter: "contrast(0.5) saturate(2) brightness(1.2)",
                  mixBlendMode: "hard-light",
                  width: dimensions.width < 1500 ? "1.75rem" : "1.25rem",
                  height: dimensions.width < 1500 ? "1.75rem" : "1.25rem",
                }}
              />
            }
            scaledTextSize={scaledTextSize}
            selector={(state) => state.apm[id]}
          />
        </td>
      )}
    </tr>
  );
};

export default PlayerResources;
