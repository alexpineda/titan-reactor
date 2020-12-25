import React, { useState, useEffect, useCallback } from "react";
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

import { toggleMenu } from "./replay/replayHudReducer";
import { hoveringOverMinimap } from "../input/inputReducer";

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return useCallback(() => setValue((value) => ++value), []); // update the state to force render
}

const Replay = ({
  gameSurface,
  gameDimensions,
  minimapCanvas,
  previewSurface,
  players,
  settings,
  errors,
  saveSettings,
  phrases,
  showMenu,
  selectedUnits,
  showProduction,
  showResources,
  showReplayControls,
  showUnitSelection,
  showMinimap,
  showFps,
  replayPosition,
  toggleMenu,
  onTogglePlayerPov,
  hoveringOverMinimap,
  fpsCanvas,
  callbacks,
}) => {
  const forceUpdate = useForceUpdate();
  const onRevealMap = () => {};
  const onDropPings = () => {};
  const onUnitDetails = () => {};
  const onShowAttackDetails = () => {};
  const onFollowUnit = () => {};

  useEffect(() => {
    const handle = setTimeout(() => forceUpdate(), 1000);
    return () => clearTimeout(handle);
  }, []);

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
      {showFps &&
        settings.producerWindowPosition === ProducerWindowPosition.None && (
          <WrappedElement domElement={fpsCanvas} />
        )}
      {settings.producerWindowPosition != ProducerWindowPosition.None && (
        <ProducerBar
          gameSurface={gameSurface}
          previewSurface={previewSurface}
          fpsCanvas={fpsCanvas}
          position={settings.producerWindowPosition}
          size={settings.producerDockSize}
          replayPosition={replayPosition}
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
      {showProduction && (
        <Production
          players={players}
          textSize={settings.textSize}
          gameDimensions={gameDimensions}
        />
      )}
      <Visible visible={showResources && !settings.esportsHud}>
        <ResourcesBar
          className="flex absolute"
          style={{
            top: `${gameDimensions.top}px`,
            right: `${gameDimensions.right}px`,
          }}
          players={players}
          textSize={settings.textSize}
          gameDimensions={gameDimensions}
          onTogglePlayerPov={onTogglePlayerPov}
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
        {showMinimap && (
          <Minimap
            onRevealMap={onRevealMap}
            onDropPings={onDropPings}
            timeLabel={replayPosition.getFriendlyTime()}
            textSize={settings.textSize}
            canvas={minimapCanvas}
            hoveringOverMinimap={hoveringOverMinimap}
          />
        )}
        <div className="flex flex-1">
          <Visible visible={showResources && settings.esportsHud}>
            <ResourcesBar
              className="flex-1 self-end"
              players={players}
              textSize="lg"
              gameDimensions={gameDimensions}
              onTogglePlayerPov={onTogglePlayerPov}
              fitToContent
            />
          </Visible>

          <Visible
            visible={
              showUnitSelection &&
              (selectedUnits.length || settings.alwaysHideReplayControls)
            }
          >
            <UnitSelection
              units={selectedUnits}
              onUnitDetails={onUnitDetails}
              onShowAttackDetails={onShowAttackDetails}
              onFollowUnit={onFollowUnit}
              followingUnit={null}
              textSize={settings.textSize}
            />
          </Visible>
          <Visible
            visible={
              showReplayControls &&
              !settings.alwaysHideReplayControls &&
              selectedUnits.length === 0
            }
          >
            <ReplayPosition
              replayPosition={replayPosition}
              onTogglePaused={() => replayPosition.togglePlay()}
              onChangePosition={(pos) => {
                replayPosition.goto(Math.floor(pos * replayPosition.maxFrame));
              }}
              onChangeAutoGameSpeed={(val) => {
                replayPosition.setAutoSpeed(val);
              }}
              onChangeGameSpeed={(speed) => {
                replayPosition.gameSpeed = speed;
              }}
              textSize={settings.textSize}
            />
          </Visible>
        </div>
      </div>
    </>
  );
};

export default connect(
  (state, { scene }) => {
    return {
      settings: state.settings.data,
      phrases: state.settings.phrases,
      errors: state.settings.errors,
      players: scene.players,
      gameSurface: scene.gameSurface,
      gameDimensions: scene.gameSurface.getRect(),
      minimapCanvas: scene.minimapSurface.canvas,
      previewSurface: scene.previewSurface,
      showMenu: state.replay.hud.showMenu,
      showProduction: state.replay.hud.showProduction,
      showResources: state.replay.hud.showResources,
      showMinimap: state.replay.hud.showMinimap,
      showReplayControls: state.replay.hud.showReplayControls,
      showUnitSelection: state.replay.hud.showUnitSelection,
      showFps: state.replay.hud.showFps,
      selectedUnits: state.replay.hud.selectedUnits,
      replayPosition: scene.replayPosition,
      onTogglePlayerPov: scene.callbacks.onTogglePlayerPov,
      callbacks: scene.callbacks,
      fpsCanvas: scene.fpsCanvas,
      gameTick: state.titan.gameTick,
    };
  },
  (dispatch) => ({
    toggleMenu: (val) => dispatch(toggleMenu(val)),
    saveSettings: (settings) => dispatch(setRemoteSettings(settings)),
    hoveringOverMinimap: (val) => dispatch(hoveringOverMinimap(val)),
  })
)(Replay);
