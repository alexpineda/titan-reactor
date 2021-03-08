import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import WrappedElement from "./WrappedElement";
import Minimap from "./game/Minimap";
import Production from "./game/Production";
import ResourcesBar from "./game/ResourcesBar";
import UnitSelection from "./game/UnitSelection";
import ReplayPosition from "./game/ReplayPosition";
import ProducerBar from "./game/ProducerBar";
import Menu from "./game/Menu";
import Visible from "./components/visible";
import { ProducerWindowPosition } from "common/settings";

import { toggleMenu } from "./game/replayHudReducer";

const Game = ({
  gameSurface,
  gameDimensions,
  minimapCanvas,
  previewSurfaces,
  players,
  settings,
  showMenu,
  selectedUnits,
  showReplayControls,
  showUnitSelection,
  showFps,
  replayPosition,
  toggleMenu,
  onTogglePlayerPov,
  fpsCanvas,
  mapLabel,
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
      <Visible visible={!settings.esportsHud}>
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
        <Minimap
          mapLabel={mapLabel}
          className="pointer-events-auto"
          timeLabel={managedDomElements.timeLabel.domElement}
          canvas={minimapCanvas}
        />

        <Visible visible={settings.esportsHud}>
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
      gameDimensions: state.replay.camera.dimensions,
      minimapCanvas: scene.minimapSurface.canvas,
      previewSurfaces: scene.previewSurfaces,
      gameIcons: scene.gameIcons,
      cmdIcons: scene.cmdIcons,
      raceInsetIcons: scene.raceInsetIcons,
      mapLabel: scene.chk.title,
      showMenu: state.replay.hud.showMenu,
      showProduction: state.replay.hud.showProduction,
      showResources: state.replay.hud.showResources,
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
)(Game);
