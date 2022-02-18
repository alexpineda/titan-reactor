import React, { useRef } from "react";
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
const pluginSelector = (state: SettingsStore) => state.plugins;

// toggle store
//  selectedUnits: state.selectedUnits,

const GameView = () => {
  const { dimensions, players } = useGameStore(gameStoreSelector, shallow);
  const showFps = useSettingsStore(settingsSelector);
  const plugins = useSettingsStore(pluginSelector);
  const itemEls: React.MutableRefObject<HTMLIFrameElement[]> = useRef([]);

  console.log("gameview");
  return (
    <>
      {showFps && <FpsDisplay />}
      {/* {plugins.map((plugin) => (
        <iframe
          key={plugin.name}
          style={{ border: 0 }}
          ref={(element) => {
            if (element) {
              itemEls.current.push(element);
            }
          }}
          src={plugin.src}
        />
      ))} */}
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
