import React from "react";
import { connect } from "react-redux";
import WrappedElement from "./WrappedElement";
import { LoadingOverlay } from "./LoadingOverlay";
import Initializing from "./home/Initializing";
import Map from "./Map";
import Replay from "./Replay";
import { LoadingProgress } from "./LoadingProgress";
import FileDropZone from "./components/FileDropZone";
import "./css/tailwind.min.css";
import "./css/pattern.min.css";
import "./css/icon.css";
import "./css/styles.css";
import "./css/bevel.css";

import Home from "./home/Home";
import Visible from "./components/visible";

const App = ({
  chk,
  criticalError,
  replayLoading,
  replayLoaded,
  replayHeader,
  mapLoading,
  mapLoaded,
  initializing,
  initialized,
  filename,
  phrases,
  scene,
}) => {
  return (
    <>
      {criticalError && (
        <p>There was a critical error. Try deleting your settings file.</p>
      )}
      {!criticalError && (
        <>
          {initializing && <Initializing phrases={phrases} />}

          <Visible visible={initialized}>
            {!mapLoaded && !replayLoaded && <Home />}
            {mapLoaded && <Map gameSurface={scene.gameSurface} />}
            {replayLoaded && <Replay scene={scene} />}
          </Visible>

          <Visible visible={mapLoading}>
            {!chk && (
              <LoadingOverlay label={"Loading Map"} description={filename} />
            )}
            {chk && (
              <LoadingOverlay
                label={chk.title}
                description={chk.description}
                // mapPreview={<WrappedElement domElement={chkPreviewCanvas} />}
              />
            )}
          </Visible>

          {replayLoading && (
            <>
              {!chk && (
                <LoadingOverlay
                  label={"Loading Replay"}
                  description={filename}
                  header={replayHeader}
                />
              )}
              {chk && (
                <LoadingOverlay
                  label={chk.title}
                  description={chk.tilesetName}
                  // mapPreview={<WrappedElement domElement={chkPreviewCanvas} />}
                  header={replayHeader}
                />
              )}
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
    filename: titanReactor.filename,
    initializing: processes.init.started,
    initialized: processes.init.completed,
    replayLoading: processes.replay.started,
    replayLoaded: processes.replay.completed,
    mapLoading: processes.map.started,
    mapLoaded: processes.map.completed,
    chk: titanReactor.chk,
    chkPreviewCanvas: titanReactor.chkPreviewCanvas,
    replayHeader: titanReactor.rep ? titanReactor.rep.header : null,
    criticalError: state.titan.criticalError,
    phrases: state.settings.phrases,
    scene: titanReactor.scene,
  };
};

export default connect(mapStateToProps)(App);
