import React from "react";
import LoadingOverlay from "./loading-overlay";
import { useScreenStore } from "../stores";
import LogDisplay from "./log-display";
import GameView from "./game-view";
import { ScreenStatus, ScreenType } from "../../common/types";
import PluginsChannelsSlot from "./plugin-channels-slot";
import * as pluginSystem from "../plugin-system";

const App = () => {
  const screen = useScreenStore();
  const slots = pluginSystem.getSlots();

  return (
    <React.StrictMode>
      <>
        {screen.status !== ScreenStatus.Error &&
          slots.map((slot) => (
            <PluginsChannelsSlot
              key={slot.name}
              screenType={screen.type}
              screenStatus={screen.status}
              slotConfig={slot}
            />
          ))}
        {screen.status === ScreenStatus.Error && <LogDisplay />}
        {screen.type === ScreenType.Home && <LogDisplay />}
        {(screen.type === ScreenType.Map ||
          screen.type === ScreenType.Replay) &&
          screen.status === ScreenStatus.Loading && (
            <LoadingOverlay screen={screen} />
          )}
        {/* {screen.type === ScreenType.Map && <Map />} */}
        {screen.type === ScreenType.Replay &&
          screen.status === ScreenStatus.Ready && <GameView />}
      </>
    </React.StrictMode>
  );
};

export default App;
