import React from "react";
import LoadingOverlay from "./loading-overlay";
import { useScreenStore } from "../stores";
import LogDisplay from "./log-display";
import GameView from "./game-view";
import PluginsView from "./plugins-view";
import { ScreenStatus, ScreenType } from "../../common/types";

const App = () => {
  const screen = useScreenStore();

  return (
    <React.StrictMode>
      <>
        {/* {screen.status !== ScreenStatus.Error && (
          <PluginsView screenStatus={screen.status} screenType={screen.type} />
        )} */}
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
