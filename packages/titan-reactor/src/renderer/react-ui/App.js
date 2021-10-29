import React from "react";
import shallow from "zustand/shallow";
import LoadingOverlay from "./LoadingOverlay";
import CornerStatus from "./CornerStatus";
import Initializing from "./home/Initializing";
import Map from "./Map";
import Game from "./Game";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import "./css/styles.css";
import "./css/bevel.css";
import "./css/glitch.css";

import Home from "./home/Home";

import useTitanReactorStore from "../stores/titanReactorStore";
import useSettingsStore from "../stores/settingsStore";
import useLoadingStore from "../stores/loadingStore";
import useGameStore from "../stores/gameStore";

const criticalErrorSelector = (state) => state.criticalError;
const loadingSelector = (state) => ({
  initialized: state.initialized,
  chk: state.chk,
  rep: state.rep,
});
const gameIsLoadedSelector = (state) => Boolean(state.game);
const phrasesSelector = (state) => state.phrases;
const errorsSelector = (state) => state.errors;

const App = () => {
  const criticalError = useTitanReactorStore(criticalErrorSelector);
  const { initialized, chk, rep } = useLoadingStore(loadingSelector, shallow);
  const gameIsLoaded = useGameStore(gameIsLoadedSelector);

  const phrases = useSettingsStore(phrasesSelector);
  const errors = useSettingsStore(errorsSelector);

  return (
    <React.StrictMode>
      {criticalError && (
        <div className="w-screen h-screen flex justify-center items-center">
          <p className="text-white font-xl">
            There was a critical error. Try deleting your settings file.
          </p>
        </div>
      )}
      {!criticalError && !initialized && <Initializing phrases={phrases} />}

      {!criticalError && initialized && (
        <>
          {errors.length === 0 && !gameIsLoaded && <CornerStatus />}
          {!chk.loaded && !rep.loaded && <Home />}
          {chk.loaded && <Map />}
          {rep.loaded && <Game />}
          {(chk.loading || rep.loading) && (
            <LoadingOverlay chk={chk} rep={rep} />
          )}
        </>
      )}
    </React.StrictMode>
  );
};

export default App;
