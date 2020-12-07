import React, { useEffect, useState } from "react";
import { gameSpeeds, gameSpeedNames } from "../../utils/conversions";
import sparkly from "sparkly";

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
  paused,
  position,
  destination,
  autoSpeed,
  timeLabel,
  gameSpeed,
  maxFrame,
  onTogglePaused,
  onChangePosition,
  onChangeAutoGameSpeed,
  onChangeGameSpeed,
  onToggleProduction,
  onToggleResources,
  textSize,
}) => {
  const progress = Math.ceil(position * 100);

  const [hideProgress, setHideProgress] = useState(true);
  const [showProduction, setShowProduction] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [positionLabel, setPositionLabel] = useState("");

  const [autoSpeedMode, setAutoSpeedMode] = useState(0);

  const [prevAutoSpeeds, setPrevAutoSpeeds] = useState([0, 0, 0]);

  const maxSpeed = gameSpeeds["1.5x"];
  const deltaSpeeds = gameSpeeds.fastest - maxSpeed;
  const totalSpeeds = gameSpeeds.fastest + (gameSpeeds.fastest - maxSpeed);

  useEffect(() => {
    if (!autoSpeed || destination >= 0) return;
    setPrevAutoSpeeds([
      ...prevAutoSpeeds.slice(1),
      1 - (gameSpeeds.fastest - gameSpeed) / deltaSpeeds,
    ]);
  }, [autoSpeed]);

  const autoSpeedNorm = 1 - (gameSpeeds.fastest - autoSpeed) / deltaSpeeds;

  const setPositionHandler = (e) => {
    const rect = e.target.getBoundingClientRect();
    const p = (e.clientX - rect.left) / (rect.right - rect.left);

    onChangePosition && onChangePosition(p);
  };

  const setPositionLabelHandler = (e) => {
    const rect = e.target.getBoundingClientRect();
    const p = (e.clientX - rect.left) / (rect.right - rect.left);

    const t = (p * maxFrame * gameSpeeds.fastest) / 1000;
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);

    setPositionLabel(`${minutes}:${("00" + seconds).slice(-2)}`);
  };

  const canIncreaseGameSpeed = () => {
    if (autoSpeed || destination >= 0) return false;
    const i = gameSpeedsArray.indexOf(gameSpeed);
    return i < gameSpeedsArray.length - 1;
  };

  const increaseGameSpeed = () => {
    if (canIncreaseGameSpeed()) {
      const i = gameSpeedsArray.indexOf(gameSpeed);
      const newGameSpeed = gameSpeedsArray[i + 1];
      onChangeGameSpeed && onChangeGameSpeed(newGameSpeed);
    }
  };

  const canDecreaseGameSpeed = () => {
    if (autoSpeed || destination >= 0) return false;
    const i = gameSpeedsArray.indexOf(gameSpeed);
    return i > 0;
  };

  const decreaseGameSpeed = () => {
    if (canDecreaseGameSpeed()) {
      const i = gameSpeedsArray.indexOf(gameSpeed);
      const newGameSpeed = gameSpeedsArray[i - 1];
      onChangeGameSpeed && onChangeGameSpeed(newGameSpeed);
    }
  };

  const timeRemainingLabel = () => {
    if (progress === 100) {
      return "Replay Completed";
    }

    let label = timeLabel;
    if (!hideProgress) {
      label = positionLabel ? positionLabel : label;
    }

    let autoSpeedLabel;
    if (destination) {
      autoSpeedLabel = "Seeking...";
    } else {
      autoSpeedLabel = autoSpeed ? (
        <span
          className="cursor-pointer"
          onClick={() => {
            setAutoSpeedMode((autoSpeedMode + 1) % 3);
          }}
        >
          &nbsp;
          {autoSpeedMode == 2 && <span className="text-gray-500">Auto</span>}
          <span>
            <span className="text-gray-400">
              {autoSpeedMode == 1 &&
                `${Math.floor(totalSpeeds / autoSpeed)}.${(
                  "0" +
                  ((totalSpeeds / autoSpeed) %
                    Math.floor(totalSpeeds / autoSpeed))
                ).slice(-1)}x`}
            </span>
            <span className="text-gray-700 absolute ml-1">
              {autoSpeedMode == 0 &&
                sparkly([autoSpeedNorm, autoSpeedNorm, autoSpeedNorm], {
                  minimum: 0,
                  maximum: 1,
                })}
            </span>
            <span className="text-gray-600 absolute">
              {autoSpeedMode == 0 &&
                sparkly(prevAutoSpeeds, {
                  minimum: 0,
                  maximum: 1,
                })}
            </span>
          </span>
        </span>
      ) : (
        capitalizeFirst(gameSpeedNames[gameSpeed])
      );
    }

    return (
      <>
        {label} - {autoSpeedLabel}
      </>
    );
  };
  const smallIconFontSize = textSize === "xs" ? "0.75rem" : "0.9rem";

  return (
    <div
      className="replay-parent flex self-end select-none"
      style={{ height: "26vh", width: "24vw" }}
    >
      <div
        className="replay-position rounded mb-2 p-2 border-2 border-yellow-900 flex-1 flex"
        style={{ backgroundColor: "#1a202caa" }}
      >
        <article className="flex-1 flex flex-col justify-around">
          <span className="flex flex-col items-center justify-center  mb-2">
            <p className={`text-yellow-400 text-${textSize} inline-block`}>
              Replay Progress
            </p>
            <p
              className={` text-${textSize} ${
                positionLabel && !hideProgress
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            >
              {timeRemainingLabel()}
            </p>
          </span>

          <div className="position control">
            <div
              className={`h-3 bg-black rounded-sm border-2 border-gray-800 cursor-pointer`}
              onClick={setPositionHandler}
              onMouseMove={setPositionLabelHandler}
              onMouseLeave={() => setPositionLabel("")}
            >
              {!hideProgress && (
                <div
                  style={{
                    width: `${progress}%`,
                  }}
                  className={`pointer-events-none h-full rounded-sm pattern-vertical-stripes-sm ${
                    progress === 100
                      ? "bg-red-700 text-red-800"
                      : "bg-green-700 text-green-800"
                  }`}
                >
                  &nbsp;
                </div>
              )}
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
                    onTogglePaused && onTogglePaused(!paused);
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
                  {paused ? "play_arrow" : "pause"}
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
                  data-tip="Autospeed"
                  onClick={() => {
                    if (!onChangeAutoGameSpeed) return;
                    if (autoSpeed > 0) {
                      onChangeAutoGameSpeed(0);
                    } else {
                      onChangeAutoGameSpeed(gameSpeeds.fastest);
                    }
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
            className={`material-icons rounded cursor-pointer hover:text-yellow-500 ${
              hideProgress ? "text-gray-700 " : "text-yellow-700 "
            }`}
            style={{ fontSize: smallIconFontSize }}
            data-tip={hideProgress ? "Show Progress" : "Hide Progress"}
          >
            remove_red_eye
          </i>
          {/* <i
            className="material-icons text-yellow-700 rounded cursor-pointer"
            style={{ fontSize: smallIconFontSize }}
            data-tip="Preview Scrubber"
          >
            launch
          </i> */}
          {/* <i
            className="material-icons text-yellow-700 rounded cursor-pointer"
            style={{ fontSize: "0.75rem" }}
            data-tip="Allow Cinematics"
          >
            voice_chat
          </i> */}

          <i
            onClick={() => {
              onToggleResources && onToggleResources(!showResources);
              setShowResources(!showResources);
            }}
            className={`material-icons rounded cursor-pointer hover:text-yellow-500 ${
              showResources ? "text-yellow-700" : "text-gray-700 "
            }`}
            style={{ fontSize: smallIconFontSize }}
            data-tip="Show Resources (Top Right)"
          >
            view_module
          </i>

          <i
            onClick={() => {
              onToggleProduction && onToggleProduction(!showProduction);
              setShowProduction(!showProduction);
            }}
            className={`material-icons rounded cursor-pointer hover:text-yellow-500 ${
              showProduction ? "text-yellow-700" : "text-gray-700 "
            }`}
            style={{ fontSize: smallIconFontSize, marginTop: "auto" }}
            data-tip="Show Production (Top Left)"
          >
            timeline
          </i>
        </aside>
      </div>
    </div>
  );
};
