import React, { useState } from "react";
import { gameSpeeds, gameSpeedNames } from "../../utils/conversions";

const gameSpeedsArray = [
  gameSpeeds.slowest,
  gameSpeeds.slower,
  gameSpeeds.slow,
  gameSpeeds.normal,
  gameSpeeds.fast,
  gameSpeeds.faster,
  gameSpeeds.fastest,
  gameSpeeds["1.5x"],
  gameSpeeds["2x"],
  gameSpeeds["4x"],
  gameSpeeds["8x"],
  gameSpeeds["16x"],
];

const capitalizeFirst = (str) => {
  return str[0].toUpperCase() + str.substr(1);
};

export default ({
  position,
  timeLabel,
  defaultGameSpeed,
  onTogglePlay,
  onChangePosition,
  onChangeAutoGameSpeed,
  onChangeGameSpeed,
  onToggleProduction,
  onToggleResources,
  textSize,
}) => {
  const progress = Math.ceil(position * 100);

  const [gameSpeed, setGameSpeed] = useState(defaultGameSpeed);
  const [hideProgress, setHideProgress] = useState(false);
  const [showProduction, setShowProduction] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [autoSpeed, setAutoSpeed] = useState(false);
  const [play, setPlay] = useState(true);

  const setPositionHandler = (e) => {
    const rect = e.target.getBoundingClientRect();
    console.log(e.clientX - rect.left, rect.right - rect.left);
    const p = (e.clientX - rect.left) / (rect.right - rect.left);

    onChangePosition && onChangePosition(p);
  };

  const canIncreaseGameSpeed = () => {
    const i = gameSpeedsArray.indexOf(gameSpeed);
    return i < gameSpeedsArray.length - 1;
  };

  const increaseGameSpeed = () => {
    if (canIncreaseGameSpeed()) {
      const i = gameSpeedsArray.indexOf(gameSpeed);
      const newGameSpeed = gameSpeedsArray[i + 1];
      setGameSpeed(newGameSpeed);
      onChangeGameSpeed && onChangeGameSpeed(newGameSpeed);
    }
  };

  const canDecreaseGameSpeed = () => {
    const i = gameSpeedsArray.indexOf(gameSpeed);
    return i > 0;
  };

  const decreaseGameSpeed = () => {
    if (canDecreaseGameSpeed()) {
      const i = gameSpeedsArray.indexOf(gameSpeed);
      const newGameSpeed = gameSpeedsArray[i - 1];
      setGameSpeed(newGameSpeed);
      onChangeGameSpeed && onChangeGameSpeed(newGameSpeed);
    }
  };

  const timeRemainingLabel = () => {
    if (progress === 100) {
      return "Replay Completed";
    }

    return (
      <>
        {timeLabel} -{" "}
        {autoSpeed ? "Auto" : capitalizeFirst(gameSpeedNames[gameSpeed])}
      </>
    );
  };
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";

  return (
    <div className="replay-parent flex-1 max-w-xs flex items-stretch select-none">
      <div
        className="replay-position rounded mb-2 p-2 border-2 border-yellow-900 flex-1 flex"
        style={{ backgroundColor: "#1a202caa" }}
      >
        <article className="flex-1 flex flex-col justify-around">
          <span className="flex flex-col items-center justify-center  mb-2">
            <p className={`text-yellow-400 text-${textSize} inline-block`}>
              Replay Progress
            </p>
            <p className={`text-gray-400 text-${textSize}`}>
              {timeRemainingLabel()}
            </p>
          </span>

          <div className="position control">
            <div
              className={`h-3 bg-black rounded-sm border-2 border-gray-800 cursor-pointer`}
              onClick={setPositionHandler}
            >
              <div
                style={{ width: `${hideProgress ? 100 : progress}%` }}
                className={`pointer-events-none h-full rounded-sm ${
                  hideProgress
                    ? "pattern-grid-sm bg-gray-700 text-gray-800 "
                    : "pattern-vertical-stripes-sm bg-green-700 text-green-800 "
                }`}
              >
                &nbsp;
              </div>
            </div>

            <div className="flex justify-around items-center p-2 mt-2">
              <span
                className={`border-2  rounded-full w-6 h-6 flex items-center justify-center  ${
                  progress < 100 ? "border-yellow-600" : "border-gray-600"
                }`}
              >
                <i
                  onClick={(e) => {
                    if (progress === 100) {
                      return;
                    }
                    onTogglePlay && onTogglePlay(!play);
                    setPlay(!play);
                  }}
                  className={`material-icons ${
                    progress < 100
                      ? "cursor-pointer text-yellow-600"
                      : "cursor-not-allowed text-gray-600"
                  }`}
                  title="hide progress"
                  style={{ fontSize: "1rem" }}
                  data-tip="Play / Pause"
                >
                  {play ? "pause" : "play_arrow"}
                </i>
              </span>

              <span
                onClick={increaseGameSpeed}
                className={`border-2 rounded-full w-6 h-6 flex items-center justify-center ${
                  autoSpeed || !canIncreaseGameSpeed()
                    ? "border-gray-600"
                    : "border-yellow-600"
                }`}
              >
                <i
                  className={`material-icons ${
                    autoSpeed || !canIncreaseGameSpeed()
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-yellow-600 cursor-pointer"
                  }`}
                  data-tip="Speed Up"
                >
                  arrow_drop_up
                </i>
              </span>

              <span
                onClick={decreaseGameSpeed}
                className={`border-2 rounded-full w-6 h-6 flex items-center justify-center ${
                  autoSpeed || !canDecreaseGameSpeed()
                    ? "border-gray-600"
                    : "border-yellow-600"
                }`}
              >
                <i
                  className={`material-icons ${
                    autoSpeed || !canDecreaseGameSpeed()
                      ? "text-gray-600 cursor-not-allowed "
                      : "text-yellow-600 cursor-pointer"
                  }`}
                  data-tip="Speed Down"
                >
                  arrow_drop_down
                </i>
              </span>

              <span
                className={`rounded-full flex items-center justify-center  ${
                  autoSpeed ? "bg-yellow-800" : "bg-yellow-900"
                }`}
              >
                <i
                  className={`material-icons cursor-pointer ${
                    autoSpeed ? "text-yellow-600" : "text-black"
                  }`}
                  data-tip="Auto Speed"
                  onClick={() => {
                    onChangeAutoGameSpeed && onChangeAutoGameSpeed(!autoSpeed);
                    setAutoSpeed(!autoSpeed);
                  }}
                >
                  rotate_right
                </i>
              </span>
            </div>
          </div>
        </article>

        <aside className="flex flex-col space-y-2 ml-2">
          <i
            onClick={() => setHideProgress(!hideProgress)}
            className={`material-icons rounded cursor-pointer ${
              hideProgress ? "text-gray-700 " : "text-yellow-700 "
            }`}
            style={{ fontSize: smallIconFontSize }}
            data-tip="Hide Progress"
          >
            remove_red_eye
          </i>
          <i
            className="material-icons text-yellow-700 rounded cursor-pointer"
            style={{ fontSize: smallIconFontSize }}
            data-tip="Preview Scrubber"
          >
            launch
          </i>
          {/* <i
            className="material-icons text-yellow-700 rounded cursor-pointer"
            style={{ fontSize: "0.75rem" }}
            data-tip="Allow Cinematics"
          >
            voice_chat
          </i> */}

          <i
            onClick={() => {
              onToggleProduction && onToggleProduction(!showProduction);
              setShowProduction(!showProduction);
            }}
            className={`material-icons rounded cursor-pointer ${
              showProduction ? "text-yellow-700" : "text-gray-700 "
            }`}
            style={{ fontSize: smallIconFontSize, marginTop: "auto" }}
            data-tip="Show Production (Top Left)"
          >
            view_module
          </i>

          <i
            onClick={() => {
              onToggleResources && onToggleResources(!showResources);
              setShowResources(!showResources);
            }}
            className={`material-icons rounded cursor-pointer ${
              showResources ? "text-yellow-700" : "text-gray-700 "
            }`}
            style={{ fontSize: smallIconFontSize }}
            data-tip="Show Resources (Top Right)"
          >
            timeline
          </i>
        </aside>
      </div>
    </div>
  );
};
