import { ipcRenderer } from "electron";
import { UI } from "./react-ui/UI";
import { getSettings, log } from "./invoke";

import { Context } from "./Context";
import { TitanReactor } from "./TitanReactor";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "../common/handleNames";
import "./utils/electronFileLoader";

let replayPlaylist = [];
let replayIndex = 0;
let titanReactor;

async function bootup() {
  const context = new Context(window);
  const ui = new UI(document.getElementById("app"), context);

  const settings = await getSettings();
  if (settings.errors.length) {
    return false;
  }

  const lang = await import(`common/lang/${settings.language}`);
  ui.loading(lang);

  context.initRenderer();

  titanReactor = new TitanReactor(context, ui);
  await titanReactor.init(settings);

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
