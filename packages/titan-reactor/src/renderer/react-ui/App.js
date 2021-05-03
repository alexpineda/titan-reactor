import React from "react";
import ReactTooltip from "react-tooltip";
import { LoadingOverlay } from "./LoadingOverlay";
import Initializing from "./home/Initializing";
import Map from "./Map";
import Game from "./Game";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import "./css/styles.css";
import "./css/bevel.css";

import Home from "./home/Home";
import Visible from "./components/visible";

import useTitanReactorStore from "../stores/titanReactorStore";
import useSettingsStore from "../stores/settingsStore";
import useLoadingStore from "../stores/loadingStore";

const App = () => {
  const criticalError = useTitanReactorStore((state) => state.criticalError);
  const phrases = useSettingsStore((state) => state.phrases);
  const { initialized, chk, rep } = useLoadingStore((state) => ({
    initialized: state.initialized,
    chk: state.chk,
    rep: state.rep,
  }));

  return (
    <>
      <ReactTooltip id="upgrades" />

      {criticalError && (
        <p>There was a critical error. Try deleting your settings file.</p>
      )}
      {!criticalError && (
        <>
          {!initialized && <Initializing phrases={phrases} />}

          <Visible visible={initialized}>
            {!chk.loaded && !rep.loaded && <Home />}
            {chk.loaded && <Map />}
            {rep.loaded && <Game />}
            {(chk.loading || rep.loading) && (
              <LoadingOverlay chk={chk} rep={rep} />
            )}
          </Visible>
        </>
      )}
    </>
  );
};

export default App;
