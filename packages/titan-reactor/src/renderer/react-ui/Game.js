import React, { useMemo } from "react";
import shallow from "zustand/shallow";
import { ipcRenderer } from "electron";
import {
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
} from "../../common/ipc/handleNames";

import WrappedElement from "./WrappedElement";
import Minimap from "./game/Minimap";
import StandAloneProductionBar from "./game/production/StandAloneProductionBar";
import Chat from "./game/Chat";
import ResourcesBar from "./game/resources/ResourcesBar";
import UnitSelection from "./game/UnitSelection";
import ReplayPosition from "./game/NewReplayPosition";
import Menu from "./game/Menu";
import Visible from "./components/visible";

import useGameStore from "../stores/gameStore";
import useSettingsStore from "../stores/settingsStore";
import useHudStore from "../stores/hudStore";
import useLoadingStore from "../stores/loadingStore";

const gameStoreSelector = (state) => ({
  dimensions: state.dimensions,
  canvas: state.game.gameSurface.canvas,
  selectedUnits: state.selectedUnits,
  players: state.game.players,
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
  alwaysHideReplayControls: state.data.alwaysHideReplayControls,
  embedProduction: state.data.embedProduction,
  mapsPath: state.data.mapsPath,
  replaysPath: state.data.replaysPath,
});

const resetSelector = (state) => state.reset;

const Game = () => {
  const { dimensions, canvas, selectedUnits, players } = useGameStore(
    gameStoreSelector,
    shallow
  );
  const resetLoadingStore = useLoadingStore(resetSelector);
  const {
    showInGameMenu,
    toggleInGameMenu,
    showReplayControls,
    showUnitSelection,
  } = useHudStore(hudStoreSelector, shallow);

  const {
    esportsHud,
    alwaysHideReplayControls,
    embedProduction,
    mapsPath,
    replaysPath,
  } = useSettingsStore(settingsStoreSelector, shallow);

  const [canvasStyle, topRightResourcesStyle, bottomResourcesStyle] = useMemo(
    () => [
      {
        position: "absolute",
        zIndex: "-10",
        left: `${dimensions.left}px`,
        top: `${dimensions.top}px`,
      },
      {
        top: `${dimensions.top}px`,
        right: `${dimensions.right}px`,
      },
      {
        bottom: `${dimensions.bottom}px`,
        width: `${dimensions.width}px`,
        left: `${dimensions.left}px`,
      },
    ],
    [dimensions]
  );

  return (
    <>
      <WrappedElement style={canvasStyle} domElement={canvas} />
      <Chat minimapSize={dimensions.minimapSize} />

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
          style={topRightResourcesStyle}
          players={players}
        />
      </Visible>

      <div
        className="w-full flex absolute pointer-events-none justify-between"
        style={bottomResourcesStyle}
      >
        <Minimap className="pointer-events-auto" />

        <Visible visible={esportsHud}>
          <ResourcesBar
            className="flex-1 self-end pointer-events-none"
            textSize="lg"
            fitToContent
            players={players}
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
