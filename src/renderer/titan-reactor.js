import { getSettings, loadAllDataFiles, openFile, log } from "./invoke";
import { ipcRenderer } from "electron";
import { UI } from "./react-ui/UI";

import { UnitDAT } from "../main/units/UnitsDAT";
import { Context } from "./Context";
import { TitanReactor } from "./TitanReactor";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "../common/handleNames";
import "./utils/electronFileLoader";

let context, titanReactor, ui, bwDat;
let replayPlaylist = [];
let replayIndex = 0;

async function initTitanReactor(settings) {
  if (titanReactor) return;
  //@todo move parsing to renderer so I don't have to reassign shit
  log("loading DAT and ISCRIPT files");
  const origBwDat = await loadAllDataFiles(settings.starcraftPath);
  bwDat = {
    ...origBwDat,
    units: origBwDat.units.map((unit) => new UnitDAT(unit)),
  };
  window.bwDat = bwDat;
  titanReactor = new TitanReactor(context, ui, openFile, bwDat);
}

async function bootup() {
  context = new Context(window);

  const settings = await getSettings();
  if (!settings.errors.length) {
    initTitanReactor(settings);
  }
  ui = new UI(document.getElementById("app"), context);

  context.initRenderer();
  ui.home();
}

ipcRenderer.on(OPEN_MAP_DIALOG, async (event, [map]) => {
  if (!titanReactor) return;
  log(`opening map ${map}`);
  titanReactor.spawnMapViewer(map);
});

ipcRenderer.on(OPEN_REPLAY_DIALOG, (event, replays) => {
  if (!titanReactor) return;
  replayPlaylist = replays;
  replayIndex = 0;
  log(`opening replay ${replays[0]}`);
  titanReactor.spawnReplay(replays[0]);
});

async function controlPanel() {}

window.location.search.includes("controlpanel") ? controlPanel() : bootup();
