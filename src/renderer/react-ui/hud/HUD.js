import React, { useState } from "react";
import Minimap from "./Minimap";
import Production from "./Production";
import Resources from "./Resources";
import ReactTooltip from "react-tooltip";
import UnitSelection from "./UnitSelection";
import ReplayPosition from "./ReplayPosition";

const config = {
  textSize: "sm",
  showTooltips: true,
};

export default ({
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
        <Production players={players} textSize={config.textSize} />
      )}
      {!hideResources && (
        <Resources
          onTogglePlayerVision={onTogglePlayerVision}
          onTogglePlayerPov={onTogglePlayerPov}
          players={players}
          textSize={config.textSize}
        />
      )}
      {UnitDetails && <UnitDetails onClose={onUnitDetails} />}
      <div className="w-full flex absolute bottom-0 divide-x-4 divide-transparent px-2">
        <Minimap
          onRevealMap={onRevealMap}
          onDropPings={onDropPings}
          timeLabel={timeLabel}
          textSize={config.textSize}
          canvas={minimapCanvas}
          hideMinimap={hideMinimap}
        />
        <div className="flex flex-1">
          <UnitSelection
            units={selectedUnits}
            onUnitDetails={onUnitDetails}
            onShowAttackDetails={onShowAttackDetails}
            onFollowUnit={onFollowUnit}
            followingUnit={followingUnit}
            textSize={config.textSize}
            hideUnitSelection={hideUnitSelection}
          />
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
        </div>
      </div>
    </>
  );
};
