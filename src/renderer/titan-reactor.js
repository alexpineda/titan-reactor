import { hot as hotReplay } from "./TitanReactorReplay";
import { hot as hotSandbox } from "./TitanReactorMapSandbox";
import { loadAllDataFiles, openFile } from "./invoke";
import { ipcRenderer } from "electron";
import { UI } from "./react-ui/UI";

import { UnitDAT } from "../main/units/UnitsDAT";
import { Context } from "./Context";
import { TitanReactor } from "./TitanReactor";

let context, titanReactor, ui, bwDat;
let replayPlaylist = [];
let replayIndex = 0;

console.log(new Date().toLocaleString());

if (module.hot) {
  module.hot.decline();

  module.hot.accept("./TitanReactorReplay.js", () => {
    if (hotReplay && hotReplay.filepath) {
      console.log("hot loading replay", hotReplay.filepath);
      titanReactor.spawnReplay(hotReplay.filepath);
    }
  });

  module.hot.accept("./TitanReactorMapSandbox.js", () => {
    if (hotSandbox && hotSandbox.filepath) {
      console.log("hot loading map", hotSandbox.filepath);
      titanReactor.spawnMapViewer(hotSandbox.filepath);
    }
  });
}

async function bootup() {
  context = new Context(window);
  await context.loadSettings();

  //@todo move parsing to renderer so I don't have to reassign shit
  const origBwDat = await loadAllDataFiles(context.bwDataPath);
  bwDat = {
    ...origBwDat,
    units: origBwDat.units.map((unit) => new UnitDAT(unit)),
  };
  window.bwDat = bwDat;

  ui = new UI(
    document.getElementById("app"),
    context.getGameCanvas(),
    context.getMinimapCanvas()
  );

  titanReactor = new TitanReactor(context, ui, openFile, bwDat);

  context.initRenderer();
  ui.render();
}

ipcRenderer.on("open-map", async (event, [map]) => {
  console.log("open-map");
  titanReactor.spawnMapViewer(map);
});

ipcRenderer.on("open-replay", (event, replays) => {
  console.log("open-replay");
  replayPlaylist = replays;
  replayIndex = 0;
  titanReactor.spawnReplay(replays[0]);
});

async function controlPanel() {}

window.location.search.includes("controlpanel") ? controlPanel() : bootup();
