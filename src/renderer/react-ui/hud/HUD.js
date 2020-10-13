import React, { useState } from "react";
import Minimap from "./Minimap";
import Production from "./Production";
import Resources from "./Resources";
import ReactTooltip from "react-tooltip";
import Details from "./Details";
import ReplayPosition from "./ReplayPosition";
import { gameSpeeds } from "../../utils/conversions";

const config = {
  textSize: "sm",
  showTooltips: true,
};

const demo = {
  position: 90,
  selectedUnits: [],
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
  onShowHeatMap,
  heatmapEnabled,
}) => {
  const [showResources, setShowResources] = useState(true);
  const [showProduction, setShowProduction] = useState(true);

  const onTogglePlayerVision = (e) => {
    console.log("onTogglePlayerVision", e);
  };
  const onTogglePlayerFPV = (e) => {
    console.log("onTogglePlayerFPV", e);
  };
  const onToggleDualFPV = (e) => {
    console.log("onToggleDualFPV", e);
  };

  const onRevealMap = (e) => {
    console.log("onRevealMap", e);
  };

  const onDropPings = (e) => {
    console.log("onDropPings", e);
  };

  const onUnitDetails = (e) => {
    console.log("onUnitDetails", e);
  };
  const onShowAttackDetails = (e) => {
    console.log("onShowAttackDetails", e);
  };
  const onFollowUnit = (e) => {
    console.log("onFollowUnit", e);
  };
  const onUnitFPV = (e) => {
    console.log("onUnitFPV", e);
  };
  const onTogglePlayerActions = (e) => {
    console.log("onTogglePlayerActions");
  };

  return (
    <>
      {config.showTooltips && <ReactTooltip textColor="#cbd5e0" />}
      {showProduction && (
        <Production players={players} textSize={config.textSize} />
      )}
      {showResources && (
        <Resources
          onTogglePlayerActions={onTogglePlayerActions}
          onTogglePlayerVision={onTogglePlayerVision}
          onTogglePlayerFPV={onTogglePlayerFPV}
          onToggleDualFPV={onToggleDualFPV}
          players={players}
          textSize={config.textSize}
        />
      )}
      <div className="w-full flex absolute bottom-0 divide-x-4 divide-transparent px-2">
        <Minimap
          onRevealMap={onRevealMap}
          onShowHeatMap={onShowHeatMap}
          heatmapEnabled={heatmapEnabled}
          onDropPings={onDropPings}
          timeLabel={timeLabel}
          textSize={config.textSize}
          canvas={minimapCanvas}
        />
        <div className="flex flex-1">
          <Details
            units={demo.selectedUnits}
            onUnitDetails={onUnitDetails}
            onShowAttackDetails={onShowAttackDetails}
            onFollowUnit={onFollowUnit}
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
