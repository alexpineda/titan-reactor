import React from "react";
import { useScreenStore } from "../stores";
import LogDisplay from "./log-display";
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
        {!(
          (screen.type === ScreenType.Map ||
            screen.type === ScreenType.Replay) &&
          screen.status === ScreenStatus.Ready
        ) && <LogDisplay />}
      </>
    </React.StrictMode>
  );
};

export default App;
