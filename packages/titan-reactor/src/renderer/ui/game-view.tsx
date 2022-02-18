import React from "react";
import shallow from "zustand/shallow";

import {
  useGameStore,
  GameStore,
  useSettingsStore,
  SettingsStore,
} from "../stores";
import FpsDisplay from "./fps-display";

const gameStoreSelector = (state: GameStore) => ({
  dimensions: state.dimensions,
  players: state.players,
});
const settingsSelector = (state: SettingsStore) => state.data.graphics.showFps;

// toggle store
//  selectedUnits: state.selectedUnits,

const GameView = () => {
  const { dimensions, players } = useGameStore(gameStoreSelector, shallow);
  const showFps = useSettingsStore(settingsSelector);

  return (
    <>
      {showFps && <FpsDisplay />}
      {/* <ResourcesBar
          className="flex-1 self-end pointer-events-none"
          fitToContent
          players={players}
        />

        <UnitSelection className="pointer-events-none" /> */}
    </>
  );
};

export default GameView;
