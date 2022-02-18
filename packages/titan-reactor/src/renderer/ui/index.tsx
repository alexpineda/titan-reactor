import React from "react";
import LoadingOverlay from "./loading-overlay";
import { useScreenStore } from "../stores";
import { ScreenStatus, ScreenType } from "../stores/screen-store";
import LogDisplay from "./log-display";
import GameView from "./game-view";

const ErrorState = ({ error }: { error: Error }) => (
  <div
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <p
      style={{
        color: "white",
      }}
    >
      There was a critical error: {error.message}
    </p>
  </div>
);

const App = () => {
  const screen = useScreenStore();
  return (
    <React.StrictMode>
      <>
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
