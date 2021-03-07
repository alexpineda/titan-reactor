import React, { useState, useEffect, useCallback } from "react";
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

import { toggleMenu } from "./replay/replayHudReducer";

const Replay = ({
  gameSurface,
  gameDimensions,
  minimapCanvas,
  previewSurfaces,
  players,
  settings,
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
  fpsCanvas,
  mapLabel,
  maxLabelWidth,
  gameIcons,
  cmdIcons,
  raceInsetIcons,
  managedDomElements,
}) => {
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
      {showFps &&
        settings.producerWindowPosition === ProducerWindowPosition.None && (
          <WrappedElement domElement={fpsCanvas} />
        )}
      {settings.producerWindowPosition != ProducerWindowPosition.None && (
        <ProducerBar
          gameSurface={gameSurface}
          previewSurfaces={previewSurfaces}
          fpsCanvas={fpsCanvas}
          replayPosition={replayPosition}
        />
      )}

      {showMenu && (
        <Menu onClose={() => toggleMenu(false)} onBackToMainMenu={() => {}} />
      )}
      {/* {showProduction && (
        <Production
          players={players}
          textSize={settings.textSize}
          gameDimensions={gameDimensions}
        />
      )} */}
      <Visible visible={showResources && !settings.esportsHud}>
        <ResourcesBar
          className="flex absolute"
          style={{
            top: `${gameDimensions.top}px`,
            right: `${gameDimensions.right}px`,
          }}
          players={players}
          gameDimensions={gameDimensions}
          onTogglePlayerPov={onTogglePlayerPov}
          gameIcons={gameIcons}
          cmdIcons={cmdIcons}
          raceInsetIcons={raceInsetIcons}
          managedDomElements={managedDomElements}
        />
      </Visible>

      {/* {UnitDetails && (
        <p>Nan</p>
        // <UnitDetails onClose={onUnitDetails} gameDimensions={gameDimensions} />
      )} */}
      <div
        className="w-full flex absolute divide-x-4 divide-transparent px-2 pointer-events-none"
        style={{
          bottom: `${gameDimensions.bottom}px`,
          width: `${gameDimensions.width}px`,
          left: `${gameDimensions.left}px`,
        }}
      >
        {showMinimap && (
          <Minimap
            mapLabel={mapLabel}
            maxLabelWidth={maxLabelWidth}
            className="pointer-events-auto"
            timeLabel={managedDomElements.timeLabel.domElement}
            canvas={minimapCanvas}
          />
        )}
        <Visible visible={showResources && settings.esportsHud}>
          <ResourcesBar
            className="flex-1 self-end pointer-events-auto"
            players={players}
            textSize="lg"
            gameDimensions={gameDimensions}
            onTogglePlayerPov={onTogglePlayerPov}
            gameIcons={gameIcons}
            cmdIcons={cmdIcons}
            raceInsetIcons={raceInsetIcons}
            fitToContent
            managedDomElements={managedDomElements}
          />
        </Visible>

        <Visible
          visible={
            showUnitSelection &&
            (selectedUnits.length || settings.alwaysHideReplayControls)
          }
        >
          <UnitSelection
            className="pointer-events-auto"
            units={selectedUnits}
            onUnitDetails={onUnitDetails}
            onShowAttackDetails={onShowAttackDetails}
            onFollowUnit={onFollowUnit}
            followingUnit={null}
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
            className="pointer-events-auto"
            replayPosition={replayPosition}
            onTogglePaused={() => replayPosition.togglePlay()}
            onChangePosition={(pos) => {
              // replayPosition.goto(Math.floor(pos * replayPosition.maxFrame));
            }}
            onChangeAutoGameSpeed={(val) => {
              replayPosition.setAutoSpeed(val);
            }}
            onChangeGameSpeed={(speed) => {
              replayPosition.gameSpeed = speed;
            }}
          />
        </Visible>
      </div>
    </>
  );
};

export default connect(
  (state, { scene }) => {
    return {
      settings: state.settings.data,
      players: scene.players,
      gameSurface: scene.gameSurface,
      gameDimensions: scene.gameSurface.getRect(),
      minimapCanvas: scene.minimapSurface.canvas,
      previewSurfaces: scene.previewSurfaces,
      gameIcons: scene.gameIcons,
      cmdIcons: scene.cmdIcons,
      raceInsetIcons: scene.raceInsetIcons,
      mapLabel: scene.chk.title,
      maxLabelWidth: scene.maxLabelWidth,
      showMenu: state.replay.hud.showMenu,
      showProduction: state.replay.hud.showProduction,
      showResources: state.replay.hud.showResources,
      showMinimap: state.replay.hud.showMinimap,
      showReplayControls: state.replay.hud.showReplayControls,
      showUnitSelection: state.replay.hud.showUnitSelection,
      showFps: state.replay.hud.showFps,
      selectedUnits: state.replay.hud.selectedUnits,
      showFogOfWar: state.replay.hud.showFogOfWar,
      replayPosition: scene.replayPosition,
      onTogglePlayerPov: scene.callbacks.onTogglePlayerPov,
      fpsCanvas: scene.fpsCanvas,
      managedDomElements: scene.managedDomElements,
    };
  },
  (dispatch) => ({
    toggleMenu: (val) => dispatch(toggleMenu(val)),
  })
)(Replay);
