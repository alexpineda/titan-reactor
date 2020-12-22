import React, { useState } from "react";
import Minimap from "./Minimap";
import Production from "./Production";
import Resources from "./Resources";
import ReactTooltip from "react-tooltip";
import UnitSelection from "./UnitSelection";
import ReplayPosition from "./ReplayPosition";
import Visible from "../components/visible";

const config = {
  textSize: "sm",
  showTooltips: true,
};

export default ({
  gameDimensions,
  players,
  paused,
  position,
  destination,
  autoSpeed,
  timeLabel,
  onChangeGameSpeed,
  onChangeAutoGameSpeed,
  onChangePosition,
  onTogglePaused,
  maxFrame,
  gameSpeed,
  minimapCanvas,
  onTogglePlayerPov,
  selectedUnits,
  onFollowUnit,
  followingUnit,
  onUnitDetails,
  UnitDetails,
  hideMinimap,
  hideUnitSelection,
  hideReplayPosition,
  hideResources,
  hideProduction,
  alwaysHideReplayControls = false,
  esportsHud = true,
}) => {
  const onTogglePlayerVision = (e) => {
    console.log("onTogglePlayerVision", e);
  };

  const onRevealMap = (e) => {
    console.log("onRevealMap", e);
  };

  const onDropPings = (e) => {
    console.log("onDropPings", e);
  };

  const onShowAttackDetails = (e) => {
    console.log("onShowAttackDetails", e);
  };

  return (
    <>
      {config.showTooltips && <ReactTooltip textColor="#cbd5e0" />}
      {!hideProduction && (
        <Production
          players={players}
          textSize={config.textSize}
          gameDimensions={gameDimensions}
        />
      )}
      <Visible visible={!hideResources && !esportsHud}>
        <Resources
          className="flex absolute"
          style={{
            top: `${gameDimensions.top}px`,
            right: `${gameDimensions.right}px`,
          }}
          onTogglePlayerVision={onTogglePlayerVision}
          onTogglePlayerPov={onTogglePlayerPov}
          players={players}
          textSize={config.textSize}
          gameDimensions={gameDimensions}
        />
      </Visible>

      {UnitDetails && (
        <UnitDetails onClose={onUnitDetails} gameDimensions={gameDimensions} />
      )}
      <div
        className="w-full flex absolute divide-x-4 divide-transparent px-2"
        style={{
          bottom: `${gameDimensions.bottom}px`,
          width: `${gameDimensions.width}px`,
          left: `${gameDimensions.left}px`,
        }}
      >
        <Minimap
          onRevealMap={onRevealMap}
          onDropPings={onDropPings}
          timeLabel={timeLabel}
          textSize={config.textSize}
          canvas={minimapCanvas}
          hideMinimap={hideMinimap}
        />
        <div className="flex flex-1">
          <Visible visible={!hideResources && esportsHud}>
            <Resources
              className="flex-1 self-end"
              onTogglePlayerVision={onTogglePlayerVision}
              onTogglePlayerPov={onTogglePlayerPov}
              players={players}
              textSize="lg"
              gameDimensions={gameDimensions}
              fitToContent
            />
          </Visible>

          {selectedUnits.length && (
            <UnitSelection
              units={selectedUnits}
              onUnitDetails={onUnitDetails}
              onShowAttackDetails={onShowAttackDetails}
              onFollowUnit={onFollowUnit}
              followingUnit={followingUnit}
              textSize={config.textSize}
              hideUnitSelection={hideUnitSelection}
            />
          )}
          <Visible
            visible={!alwaysHideReplayControls && selectedUnits.length === 0}
          >
            <ReplayPosition
              paused={paused}
              maxFrame={maxFrame}
              destination={destination}
              autoSpeed={autoSpeed}
              timeLabel={timeLabel}
              position={position}
              gameSpeed={gameSpeed}
              onTogglePaused={onTogglePaused}
              onChangePosition={onChangePosition}
              onChangeAutoGameSpeed={onChangeAutoGameSpeed}
              onChangeGameSpeed={onChangeGameSpeed}
              textSize={config.textSize}
              hideReplayPosition={hideReplayPosition}
            />
          </Visible>
        </div>
      </div>
    </>
  );
};
