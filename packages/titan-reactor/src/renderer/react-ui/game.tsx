import React, { useMemo } from "react";
import shallow from "zustand/shallow";
import { ipcRenderer } from "electron";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "../../common/ipc";

import WrappedElement from "./wrapped-element";
import Minimap from "./game/minimap";
import StandAloneProductionBar from "./game/production/stand-alone-production-bar";
import Chat from "./game/chat";
import ResourcesBar from "./game/resources/resources-bar";
import UnitSelection from "./game/unit-selection";
import ReplayPosition from "./game/new-replay-position";
import Menu from "./game/menu";
import Visible from "./components/visible";

import {
  useGameStore,
  GameStore,
  useSettingsStore,
  SettingsStore,
  useHudStore,
  HudStore,
  completeUIType,
  disposeGame,
  UITypeHome,
  initUIType,
} from "../stores";

const gameStoreSelector = (state: GameStore) => ({
  dimensions: state.dimensions,
  canvas: state.game.gameSurface.canvas,
  selectedUnits: state.selectedUnits,
  players: state.game.players,
});

const hudStoreSelector = (state: HudStore) => ({
  showFps: state.show.fps,
  showInGameMenu: state.show.inGameMenu,
  toggleInGameMenu: state.toggleInGameMenu,
  showReplayControls: state.show.replayControls,
  showUnitSelection: state.show.unitSelection,
});

const settingsStoreSelector = (state: SettingsStore) => ({
  esportsHud: state?.data?.esportsHud,
  alwaysHideReplayControls: state?.data?.alwaysHideReplayControls,
  embedProduction: state?.data?.embedProduction,
  mapsPath: state?.data?.mapsPath,
  replaysPath: state?.data?.replaysPath,
});

const resetToHome = () => {
  disposeGame();
  initUIType({ type: "home" } as UITypeHome);
  completeUIType();
};

const Game = () => {
  const { dimensions, canvas, selectedUnits, players } = useGameStore(
    gameStoreSelector,
    shallow
  );
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
            resetToHome();
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
            fitToContent
            players={players}
          />
        </Visible>

        <Visible
          visible={Boolean(
            showUnitSelection &&
              (selectedUnits.length || alwaysHideReplayControls)
          )}
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
