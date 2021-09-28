import { ipcRenderer } from "electron";
import { promises as fsPromises } from "fs";
import React from "react";
import { render } from "react-dom";
import App from "./react-ui/App";
import { log } from "./invoke";
import version from "../common/version";
import { TitanReactor } from "./TitanReactor";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "../common/handleNames";

import useTitanReactorStore from "./stores/titanReactorStore";
import useSettingsStore from "./stores/settingsStore";
import useLoadingStore from "./stores/loadingStore";
import "./stores/capabilitiesStore";

log(`titan-reactor ${version}`);
log(`chrome ${process.versions.chrome}`);
log(`electron ${process.versions.electron}`);

const loadFont = async (file, family, weight) => {
  // there's got to be a better way!
  const conthrax = await fsPromises.readFile(file);
  let str = "";
  for (let i = 0; i < conthrax.byteLength; i++) {
    str += String.fromCharCode(conthrax[i]);
  }
  const style = document.createElement("style");
  document.head.appendChild(style);
  style.appendChild(
    document.createTextNode(`
    @font-face{
        font-family: ${family};
        src: url(data:font/otf;base64,${btoa(str)});
        font-weight: ${weight};
    }
  `)
  );
};

const titanReactor = new TitanReactor();

async function bootup() {
  await loadFont(`${__static}/fonts/conthrax-rg.otf`, "conthrax", "100 400");
  await loadFont(`${__static}/fonts/conthrax-hv.otf`, "conthrax", "500 900");

  try {
    // set initializing
    await useSettingsStore.getState().load();
    useLoadingStore.setState({ initialized: true });
  } catch (err) {
    log(err.message, "error");
    console.error(err.message);
    useTitanReactorStore.setState({ criticalError: err });
  }
}

ipcRenderer.on(OPEN_MAP_DIALOG, async (_, [map]) => {
  log(`opening map ${map}`);
  titanReactor.spawnMapViewer(map);
});

ipcRenderer.on(OPEN_REPLAY_DIALOG, (_, replays) => {
  log(`opening replay ${replays[0]}`);
  titanReactor.spawnReplay(replays[0]);
});

render(<App titanReactor={titanReactor} />, document.getElementById("app"));

bootup();
