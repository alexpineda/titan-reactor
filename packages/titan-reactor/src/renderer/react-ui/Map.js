import React from "react";
import WrappedElement from "./WrappedElement";
import useGameStore from "../stores/gameStore";
import useHudStore from "../stores/hudStore";
import useSettingsStore from "../stores/settingsStore";
import useLoadingStore from "../stores/loadingStore";
import shallow from "zustand/shallow";
import Menu from "./game/Menu";
import { ipcRenderer } from "electron";
import {
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
} from "../../common/ipc/handleNames";

const hudStoreSelector = (state) => ({
  showInGameMenu: state.show.inGameMenu,
  toggleInGameMenu: state.toggleInGameMenu,
});

const settingsStoreSelector = (state) => ({
  mapsPath: state.data.mapsPath,
  replaysPath: state.data.replaysPath,
});

const Map = () => {
  const surface = useGameStore((state) => state.game.gameSurface);
  const { showInGameMenu, toggleInGameMenu } = useHudStore(
    hudStoreSelector,
    shallow
  );

  const { mapsPath, replaysPath } = useSettingsStore(
    settingsStoreSelector,
    shallow
  );

  const resetLoadingStore = useLoadingStore((state) => state.reset);

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
    </>
  );
};

export default Map;
