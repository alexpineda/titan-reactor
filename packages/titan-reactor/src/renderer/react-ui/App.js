import React from "react";
import shallow from "zustand/shallow";
import LoadingOverlay from "./LoadingOverlay";
import BackgroundPreload from "./BackgroundPreload";
import Initializing from "./home/Initializing";
import Map from "./Map";
import Game from "./Game";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import "./css/styles.css";
import "./css/bevel.css";

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
        <p>There was a critical error. Try deleting your settings file.</p>
      )}
      {!criticalError && !initialized && <Initializing phrases={phrases} />}

      {!criticalError && initialized && (
        <>
          {errors.length === 0 && !gameIsLoaded && <BackgroundPreload />}
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
