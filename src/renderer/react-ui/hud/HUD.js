import React, { useState } from "react";
import Minimap from "./Minimap";
import Production from "./Production";
import Resources from "./Resources";
import ReactTooltip from "react-tooltip";
import Details from "./Details";
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
}) => {
  const [showResources, setShowResources] = useState(true);
  const [showProduction, setShowProduction] = useState(true);

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
  const onUnitFPV = (e) => {
    console.log("onUnitFPV", e);
  };

  return (
    <>
      {config.showTooltips && <ReactTooltip textColor="#cbd5e0" />}
      {showProduction && (
        <Production players={players} textSize={config.textSize} />
      )}
      {showResources && (
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
        />
        <div className="flex flex-1">
          <Details
            units={selectedUnits}
            onUnitDetails={onUnitDetails}
            onShowAttackDetails={onShowAttackDetails}
            onFollowUnit={onFollowUnit}
            followingUnit={followingUnit}
            onUnitFPV={onUnitFPV}
            textSize={config.textSize}
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
            onToggleProduction={setShowProduction}
            onToggleResources={setShowResources}
            textSize={config.textSize}
          />
        </div>
      </div>
    </>
  );
};
