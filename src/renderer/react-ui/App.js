import React, { useState } from "react";
import { connect } from "react-redux";
import WrappedElement from "./WrappedElement";
import { LoadingOverlay } from "./LoadingOverlay";
import Initializing from "./home/Initializing";
import { LoadingProgress } from "./LoadingProgress";
import FileDropZone from "./components/FileDropZone";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import "./css/styles.css";

import Home from "./home/Home";
import Loading from "./home/Initializing";
import Visible from "./components/visible";

const App = ({
  titanReactor,
  chk,
  chkPreviewCanvas,
  criticalError,
  replayLoading,
  mapLoading,
  initializing,
  initialized,
  phrases,
}) => {
  return (
    <>
      {criticalError && (
        <p>There was a critical error. Try deleting your settings file.</p>
      )}
      {!criticalError && (
        <>
          <Visible visible={initializing}>
            <Initializing phrases={phrases} />
          </Visible>
          <Visible visible={initialized}>
            <Home />
          </Visible>

          {chk && (
            <>
              <Visible visible={replayLoading}>
                <LoadingOverlay
                  label={chk.title}
                  description={chk.tilesetName}
                  mapPreview={<WrappedElement domElement={chkPreviewCanvas} />}
                  header={titanReactor.rep.Header}
                />
              </Visible>
              <Visible visible={mapLoading}>
                <LoadingOverlay
                  label={titanReactor.chk.title}
                  description={titanReactor.chk.tilesetName}
                  mapPreview={
                    <WrappedElement
                      domElement={titanReactor.chkPreviewCanvas}
                    />
                  }
                />
              </Visible>
            </>
          )}
          {/* <LoadingOverlay label={label} description={description} /> */}
        </>
      )}
    </>
  );
};

const mapStateToProps = (state, { titanReactor }) => {
  const processes = state.titan.processes;
  return {
    initializing: processes.init.started,
    initialized: processes.init.completed,
    replayLoading: processes.replay.started,
    replay: processes.replay.completed ? titanReactor.rep : null,
    mapLoading: processes.map.started,
    mapLoaded: processes.map.completed,
    chk: processes.chk.completed ? titanReactor.chk : null,
    chkPreviewCanvas: processes.chk.completed
      ? titanReactor.chkPreviewCanvas
      : null,
    criticalError: false,
    phrases: state.settings.phrases,
  };
};

export default connect(mapStateToProps)(App);
