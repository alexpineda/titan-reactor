import { ipcRenderer } from "electron";
import { UI } from "./react-ui/UI";
import { log } from "./invoke";

import { Context } from "./Context";
import { TitanReactor } from "./TitanReactor";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "../common/handleNames";
import "./utils/electronFileLoader";

let replayPlaylist = [];
let replayIndex = 0;
const context = new Context(window);
const titanReactor = new TitanReactor(
  context,
  new UI(document.getElementById("app"), context)
);

async function bootup() {
  try {
    await context.loadSettings();
    titanReactor.reactApp.loading();
    if (!context.settings.errors.includes("starcraftPath")) {
      await titanReactor.preload();
    }
    titanReactor.reactApp.home();
  } catch (err) {
    console.error(err);
    titanReactor.reactApp.criticalError();
  }
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
