import { ipcRenderer } from "electron";
import { promises as fsPromises } from "fs";
import React from "react";
import { render } from "react-dom";

import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "../common/ipc";
import version from "../common/version";
import { log } from "./ipc";
import App from "./react-ui/app";
import { loadSettings, errorUIType, completeUIType } from "./stores";
import { TitanReactor } from "./titan-reactor";

if (module.hot) {
  module.hot.accept();
}

log(`titan-reactor ${version}`);
log(`chrome ${process.versions.chrome}`);
log(`electron ${process.versions.electron}`);

const loadFont = async (file: string, family: string, weight: string) => {
  const conthrax = (await fsPromises.readFile(file)).toString("base64");
  const style = document.createElement("style");
  document.head.appendChild(style);
  style.appendChild(
    document.createTextNode(`
    @font-face{
        font-family: ${family};
        src: url(data:font/otf;base64,${conthrax});
        font-weight: ${weight};
    }
  `)
  );
};

const loadFonts = async () => {
  await loadFont(`${__static}/fonts/conthrax-rg.otf`, "conthrax", "100 400");
  await loadFont(`${__static}/fonts/conthrax-hv.otf`, "conthrax", "500 900");
};

const titanReactor = new TitanReactor();

async function bootup() {
  try {
    await loadFonts();
    await loadSettings();
    log("bootup complete");
    completeUIType();
  } catch (err: any) {
    log(err.message, "error");
    errorUIType(err);
  }
}

ipcRenderer.on(OPEN_MAP_DIALOG, async (_, [map]) => {
  log(`opening map ${map}`);
  try {
    titanReactor.spawnMapViewer(map);
  } catch (err: any) {
    log(err.message, "error");
    errorUIType(err);
  }
});

ipcRenderer.on(OPEN_REPLAY_DIALOG, (_, replays) => {
  log(`opening replay ${replays[0]}`);
  try {
    titanReactor.spawnReplay(replays[0]);
  } catch (err: any) {
    log(err.message, "error");
    errorUIType(err);
  }
});

//@ts-ignore
render(<App />, document.getElementById("app"));
bootup();
