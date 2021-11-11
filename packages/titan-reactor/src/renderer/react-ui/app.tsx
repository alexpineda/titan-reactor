import React from "react";
import shallow from "zustand/shallow";
import LoadingOverlay from "./loading-overlay";
import CornerStatus from "./corner-status";
import Map from "./map";
import Game from "./game";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import "./css/styles.css";
import "./css/bevel.css";
import "./css/glitch.css";

import Home from "./home/home";
import { useLoadingStore, LoadingStore } from "../stores";

const screenSelector = (state: LoadingStore) => state.screen;

const ErrorState = ({ error }: { error: Error }) => (
  <div className="w-screen h-screen flex justify-center items-center">
    <p className="text-white font-xl">
      There was a critical error: {error.message}
    </p>
  </div>
);

const App = () => {
  const screen = useLoadingStore(screenSelector, shallow);

  console.log("screen", screen);

  return (
    <React.StrictMode>
      <>
        {screen.error && <ErrorState error={screen.error} />}
        {screen.loading && <CornerStatus />}
        {screen.loading && <LoadingOverlay screen={screen} />}
        {screen.loaded && (
          <>
            {screen.type === "home" && <Home />}
            {screen.type === "map" && <Map />}
            {screen.type === "replay" && <Game />}
            {/* {gameType.value.type === "iscriptah" && gameType.value.component} */}
          </>
        )}
      </>
    </React.StrictMode>
  );
};

export default App;
