import React from "react";
import WrappedElement from "./wrapped-element";
import {
  useGameStore,
  useHudStore,
  HudStore,
  useSettingsStore,
  SettingsStore,
  disposeGame,
  initUIType,
  completeUIType,
  UITypeHome,
  GameStore,
} from "../stores";
import shallow from "zustand/shallow";
import Menu from "./game/menu";
import { ipcRenderer } from "electron";
import {
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
} from "../../common/ipc-handle-names";

const hudStoreSelector = (state: HudStore) => ({
  showInGameMenu: state.show.inGameMenu,
  toggleInGameMenu: state.toggleInGameMenu,
});

const settingsStoreSelector = (state: SettingsStore) => ({
  mapsPath: state?.data?.mapsPath,
  replaysPath: state?.data?.replaysPath,
});

const surfaceSelector = (state: GameStore) => state.game.gameSurface;

const resetToHome = () => {
  disposeGame();
  initUIType({ type: "home" } as UITypeHome);
  completeUIType();
};

const Map = () => {
  const surface = useGameStore(surfaceSelector);
  const { showInGameMenu, toggleInGameMenu } = useHudStore(
    hudStoreSelector,
    shallow
  );

  const { mapsPath, replaysPath } = useSettingsStore(
    settingsStoreSelector,
    shallow
  );

  return (
    <>
      <WrappedElement
        style={{
          position: "absolute",
          zIndex: "-10",
          left: `${surface.left}px`,
          top: `${surface.top}px`,
        }}
        domElement={surface.canvas}
      />
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
    </>
  );
};

export default Map;
