import { WebGLRenderer } from "three";
import { ipcRenderer } from "electron";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import ErrorBoundary from "./react-ui/components/ErrorBoundary";
import App from "./react-ui/App";
import { log, setWebGLCapabilities } from "./invoke";
import version from "../common/version";
import { TitanReactor } from "./TitanReactor";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "../common/handleNames";
import "./utils/electronFileLoader";
import store from "./store";
import { getRemoteSettings } from "./utils/settingsReducer";
import {
  loading,
  loadingProgress,
  loadingError,
  criticalErrorOccurred,
} from "./titanReactorReducer";

log(`titan-reactor ${version}`);
log(`chrome ${process.versions.chrome}`);
log(`electron ${process.versions.electron}`);

let titanReactor = new TitanReactor(store);

WebGLRenderer.prototype.setSizeFromCanvasTarget = function (canvasTarget) {
  this._width = canvasTarget.width;
  this._height = canvasTarget.height;

  this._canvas.width = canvasTarget.scaledWidth;
  this._canvas.height = canvasTarget.scaledHeight;
};

async function bootup() {
  const renderer = new WebGLRenderer();

  await setWebGLCapabilities({
    anisotropy: renderer.capabilities.getMaxAnisotropy(),
  });
  renderer.dispose();

  const settings = (await store.dispatch(getRemoteSettings())).payload;

  //drag drop
  /*
  (data, file) => {
    const ext = file.name.split(".").pop();
    if (ext === "rep") {
      titanReactor.spawnReplay(file);
    } else if (["scx", "scm"].includes(ext)) {
      titanReactor.spawnMapViewer(file);
    }
  }*/

  try {
    store.dispatch(loading("init"));
    if (!settings.errors.includes("starcraftPath")) {
      await titanReactor.preload();
    }
    store.dispatch(loadingProgress("init"));
  } catch (err) {
    log(err.message, "error");
    console.error(err);
    store.dispatch(criticalErrorOccurred());
  }
}

ipcRenderer.on(OPEN_MAP_DIALOG, async (event, [map]) => {
  if (!titanReactor) return;
  log(`opening map ${map}`);
  titanReactor.spawnMapViewer(map);
});

ipcRenderer.on(OPEN_REPLAY_DIALOG, (event, replays) => {
  if (!titanReactor) return;
  log(`opening replay ${replays[0]}`);
  titanReactor.spawnReplay(replays[0]);
});

async function producerBootup() {
  console.log("hi");
}

render(
  <Provider store={store}>
    <App titanReactor={titanReactor} />
  </Provider>,
  document.getElementById("app")
);

window.location.search.includes("producer") ? producerBootup() : bootup();
