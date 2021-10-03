import React from "react";
import shallow from "zustand/shallow";
import { ipcRenderer } from "electron";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "common/handleNames";

import WrappedElement from "./WrappedElement";
import Minimap from "./game/Minimap";
import StandAloneProductionBar from "./game/production/StandAloneProductionBar";
import Chat from "./game/Chat";
import ResourcesBar from "./game/resources/ResourcesBar";
import UnitSelection from "./game/UnitSelection";
import ReplayPosition from "./game/ReplayPosition";
import ProducerBar from "./game/ProducerBar";
import Menu from "./game/Menu";
import Visible from "./components/visible";
import { ProducerWindowPosition } from "common/settings";

import useGameStore from "../stores/gameStore";
import useSettingsStore from "../stores/settingsStore";
import useHudStore from "../stores/hudStore";
import useLoadingStore from "../stores/loadingStore";

const gameStoreSelector = (state) => ({
  dimensions: state.dimensions,
  canvas: state.game.surface.canvas,
  selectedUnits: state.selectedUnits,
});

const hudStoreSelector = (state) => ({
  showFps: state.show.fps,
  showInGameMenu: state.show.inGameMenu,
  toggleInGameMenu: state.toggleInGameMenu,
  showReplayControls: state.show.replayControls,
  showUnitSelection: state.show.unitSelection,
});

const settingsStoreSelector = (state) => ({
  esportsHud: state.data.esportsHud,
  producerWindowPosition: state.data.producerWindowPosition,
  alwaysHideReplayControls: state.data.alwaysHideReplayControls,
  embedProduction: state.data.embedProduction,
  mapsPath: state.data.mapsPath,
  replaysPath: state.data.replaysPath,
});

const resetSelector = (state) => state.reset;

const Game = () => {
  const { dimensions, canvas, selectedUnits } = useGameStore(
    gameStoreSelector,
    shallow
  );
  const resetLoadingStore = useLoadingStore(resetSelector);
  const {
    showFps,
    showInGameMenu,
    toggleInGameMenu,
    showReplayControls,
    showUnitSelection,
  } = useHudStore(hudStoreSelector, shallow);

  const {
    esportsHud,
    producerWindowPosition,
    alwaysHideReplayControls,
    embedProduction,
    mapsPath,
    replaysPath,
  } = useSettingsStore(settingsStoreSelector, shallow);

  return (
    <>
      <WrappedElement
        style={{
          position: "absolute",
          zIndex: "-10",
          left: `${dimensions.left}px`,
          top: `${dimensions.top}px`,
        }}
        domElement={canvas}
      />
      <Chat minimapSize={dimensions.minimapSize} />
      {producerWindowPosition != ProducerWindowPosition.None && <ProducerBar />}

      {showInGameMenu && (
        <Menu
          onClose={() => toggleInGameMenu()}
          onBackToMainMenu={() => {
            toggleInGameMenu();
            resetLoadingStore();
          }}
          onOpenMap={() => {
            toggleInGameMenu();
            ipcRenderer.send(OPEN_MAP_DIALOG, mapsPath);
          }}
          onOpenReplay={() => {
            toggleInGameMenu();
            ipcRenderer.send(OPEN_REPLAY_DIALOG, replaysPath);
          }}
        />
      )}
      {(!esportsHud || !embedProduction) && <StandAloneProductionBar />}
      <Visible visible={!esportsHud}>
        <ResourcesBar
          className="flex absolute pointer-events-none"
          style={{
            top: `${dimensions.top}px`,
            right: `${dimensions.right}px`,
          }}
        />
      </Visible>

      <div
        className="w-full flex absolute pointer-events-none justify-between"
        style={{
          bottom: `${dimensions.bottom}px`,
          width: `${dimensions.width}px`,
          left: `${dimensions.left}px`,
        }}
      >
        <Minimap className="pointer-events-auto" />

        <Visible visible={esportsHud}>
          <ResourcesBar
            className="flex-1 self-end pointer-events-none"
            textSize="lg"
            fitToContent
          />
        </Visible>

        <Visible
          visible={
            showUnitSelection &&
            (selectedUnits.length || alwaysHideReplayControls)
          }
        >
          <UnitSelection className="pointer-events-none" />
        </Visible>
        <Visible
          visible={
            showReplayControls &&
            !alwaysHideReplayControls &&
            selectedUnits.length === 0
          }
        >
          <ReplayPosition className="pointer-events-auto" />
        </Visible>
      </div>
    </>
  );
};

export default Game;
