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
const settings = (state: SettingsStore) => state.data.graphics.showFps;

// toggle store
//  selectedUnits: state.selectedUnits,

const GameView = () => {
  const { dimensions, players } = useGameStore(gameStoreSelector, shallow);
  const showFps = useSettingsStore(settings);
  const itemEls: React.MutableRefObject<HTMLIFrameElement[]> = useRef([]);

  console.log("gameview");
  return (
    <>
      {showFps && <FpsDisplay />}
      {/* <iframe
          style={{
            border: 0,
          }}
          ref={(element) => {
            if (element) {
              itemEls.current.push(element);
            }
          }}
          src={`http://localhost:8000/titan-reactor-hud.html`}
        /> */}
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
