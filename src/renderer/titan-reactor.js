import { ipcRenderer } from "electron";
import { UI } from "./react-ui/UI";
import { log } from "./invoke";
import version from "../common/version";
import { Context } from "./Context";
import { TitanReactor } from "./TitanReactor";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "../common/handleNames";
import "./utils/electronFileLoader";

log(`titan-reactor ${version}`);
log(`chrome ${process.versions.chrome}`);
log(`electron ${process.versions.electron}`);

let replayPlaylist = [];
let replayIndex = 0;
const context = new Context(window);
const ui = new UI(document.getElementById("app"), context, (data, file) => {
  const ext = file.name.split(".").pop();
  if (ext === "rep") {
    titanReactor.spawnReplay(file);
  } else if (["scx", "scm"].includes(ext)) {
    titanReactor.spawnMapViewer(file);
  }
});
const titanReactor = new TitanReactor(context, ui);

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

async function producerBootup() {
  console.log("hi");
}

window.location.search.includes("producer") ? producerBootup() : bootup();
