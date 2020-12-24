import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import { connect } from "react-redux";
import WrappedElement from "./WrappedElement";
import Minimap from "./replay/Minimap";
import Production from "./replay/Production";
import ResourcesBar from "./replay/ResourcesBar";
import UnitSelection from "./replay/UnitSelection";
import ReplayPosition from "./replay/ReplayPosition";
import ProducerBar from "./replay/ProducerBar";
import Menu from "./replay/Menu";
import Visible from "./components/visible";
import { ProducerWindowPosition } from "common/settings";
import { setRemoteSettings } from "../utils/settingsReducer";
import { togglePlayerPov } from "./replay/cameraReducer";

import { toggleMenu } from "./replay/replayHudReducer";

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => ++value); // update the state to force render
}

const Replay = ({
  gameSurface,
  gameDimensions,
  minimapCanvas,
  players,
  settings,
  errors,
  saveSettings,
  phrases,
  showMenu,
  selectedUnits,
  hideProduction,
  hideResources,
  hideReplayPosition,
  hideUnitSelection,
  hideMinimap,
  replayPosition,
  toggleMenu,
}) => {
  const forceUpdate = useForceUpdate();
  const onTogglePaused = () => {};
  const onChangePosition = () => {};
  const onChangeAutoGameSpeed = () => {};
  const onChangeGameSpeed = () => {};
  const onTogglePlayerVision = () => {};
  const onRevealMap = () => {};
  const onDropPings = () => {};
  const onUnitDetails = () => {};
  const onShowAttackDetails = () => {};
  const onFollowUnit = () => {};

  return (
    <>
      <WrappedElement
        style={{
          position: "absolute",
          zIndex: "-10",
          left: `${gameSurface.left}px`,
          top: `${gameSurface.top}px`,
        }}
        domElement={gameSurface.canvas}
      />
      {settings.producerWindowPosition != ProducerWindowPosition.None && (
        <ProducerBar
          // previews={previewSurfaces}
          gameSurface={gameSurface}
          position={settings.producerWindowPosition}
          size={settings.producerDockSize}
        />
      )}

      {showMenu && (
        <Menu
          phrases={phrases}
          settings={settings}
          errors={errors}
          saveSettings={saveSettings}
          onClose={() => toggleMenu(false)}
          isReplay={true}
          hasNextReplay={false}
          onNextReplay={() => {}}
          onBackToMainMenu={() => {}}
        />
      )}
      {settings.showTooltips && <ReactTooltip textColor="#cbd5e0" />}
      {!hideProduction && (
        <Production
          players={players}
          textSize={settings.textSize}
          gameDimensions={gameDimensions}
        />
      )}
      <Visible visible={!hideResources && !settings.esportsHud}>
        <ResourcesBar
          className="flex absolute"
          style={{
            top: `${gameDimensions.top}px`,
            right: `${gameDimensions.right}px`,
          }}
          players={players}
          textSize={settings.textSize}
          gameDimensions={gameDimensions}
        />
      </Visible>

      {/* {UnitDetails && (
        <p>Nan</p>
        // <UnitDetails onClose={onUnitDetails} gameDimensions={gameDimensions} />
      )} */}
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
          timeLabel={replayPosition.getFriendlyTime()}
          textSize={settings.textSize}
          canvas={minimapCanvas}
          hideMinimap={hideMinimap}
        />
        <div className="flex flex-1">
          <Visible visible={!hideResources && settings.esportsHud}>
            <ResourcesBar
              className="flex-1 self-end"
              players={players}
              textSize="lg"
              gameDimensions={gameDimensions}
              fitToContent
            />
          </Visible>

          <Visible
            visible={selectedUnits.length || settings.alwaysHideReplayControls}
          >
            <UnitSelection
              units={selectedUnits}
              onUnitDetails={onUnitDetails}
              onShowAttackDetails={onShowAttackDetails}
              onFollowUnit={onFollowUnit}
              followingUnit={null}
              textSize={settings.textSize}
              hideUnitSelection={hideUnitSelection}
            />
          </Visible>
          <Visible
            visible={
              !settings.alwaysHideReplayControls && selectedUnits.length === 0
            }
          >
            <ReplayPosition
              replayPosition={replayPosition}
              onTogglePaused={onTogglePaused}
              onChangePosition={onChangePosition}
              onChangeAutoGameSpeed={onChangeAutoGameSpeed}
              onChangeGameSpeed={onChangeGameSpeed}
              textSize={settings.textSize}
              hideReplayPosition={hideReplayPosition}
            />
          </Visible>
        </div>
      </div>
    </>
  );
};

export default connect(
  (state, { scene }) => {
    console.log("Replay", state, scene);
    return {
      settings: state.settings.data,
      phrases: state.settings.phrases,
      errors: state.settings.errors,
      players: scene.players,
      gameSurface: scene.gameSurface,
      gameDimensions: scene.gameSurface.getRect(),
      minimapCanvas: scene.minimapSurface.canvas,
      showMenu: state.replay.hud.showMenu,
      hideProduction: state.replay.hud.hideProduction,
      hideResources: state.replay.hud.hideResources,
      hideMinimap: state.replay.hud.hideMinimap,
      hideReplayPosition: state.replay.hud.hideReplayPosition,
      hideUnitSelection: state.replay.hud.hideUnitSelection,
      selectedUnits: state.replay.hud.selectedUnits,
      replayPosition: scene.replayPosition,
    };
  },
  (dispatch) => ({
    toggleMenu: (val) => dispatch(toggleMenu(val)),
    saveSettings: (settings) => dispatch(setRemoteSettings(settings)),
  })
)(Replay);
