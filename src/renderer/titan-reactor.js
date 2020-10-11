import { hot as hotReplay } from "./replay/TitanReactorReplay";
import { hot as hotSandbox } from "./3d-map-rendering/TitanReactorSandbox";
import { GameOptions } from "./utils/GameOptions";
import { loadAllDataFiles, openFile } from "./invoke";
import { ipcRenderer } from "electron";
import { UI } from "./react-ui/UI";

import { UnitDAT } from "../main/units/UnitsDAT";
import { SceneContext } from "./SceneContext";
import { TitanReactorScene } from "./TitanReactorScene";

const gameOptions = new GameOptions();
let context, titanReactorScene, ui, bwDat;
let replayPlaylist = [];
let replayIndex = 0;

console.log(new Date().toLocaleString());

if (module.hot) {
  module.hot.decline();

  module.hot.accept("./replay/TitanReactorReplay.js", (data) => {
    if (hotReplay && hotReplay.filepath) {
      console.log("hot loading replay", hotReplay.filepath);
      titanReactorScene.spawnReplay(hotReplay.filepath);
    }
  });

  module.hot.accept("./3d-map-rendering/TitanReactorSandbox.js", () => {
    if (hotSandbox && hotSandbox.filepath) {
      console.log("hot loading map", hotSandbox.filepath);
      titanReactorScene.spawnMapViewer(hotSandbox.filepath);
    }
  });
}

async function bootup() {
  await gameOptions.load();
  //@todo move parsing to renderer so I don't have to reassign shit
  const origBwDat = await loadAllDataFiles(gameOptions.getBwDataPath());
  bwDat = {
    ...origBwDat,
    units: origBwDat.units.map((unit) => new UnitDAT(unit)),
  };
  window.bwDat = bwDat;

  context = new SceneContext(window);

  ui = new UI(document.getElementById("app"), context.getGameCanvas());

  titanReactorScene = new TitanReactorScene(
    context,
    ui,
    openFile,
    gameOptions,
    bwDat
  );

  context.initRenderer();
  ui.render();
}

ipcRenderer.on("open-map", async (event, [map]) => {
  console.log("open-map");
  titanReactorScene.spawnMapViewer(map);
});

ipcRenderer.on("open-replay", (event, replays) => {
  console.log("open-replay");
  replayPlaylist = replays;
  replayIndex = 0;
  titanReactorScene.spawnReplay(replays[0]);
});

bootup();
