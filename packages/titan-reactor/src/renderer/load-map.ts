import loadScm from "./utils/load-scm";

import Chk from "bw-chk";
import {
  ImageHD,
} from "./core";
import * as log from "./ipc/log";
import { Scene } from "./render";
import loadTerrain from "./assets/load-terrain";
import {
  disposeGame,
  setGame,
  startLoadingProcess,
  updateIndeterminateLoadingProcess,
  completeLoadingProcess,
  initScreen,
  updateScreen,
  completeScreen,
  MapScreen,
  getGame,
} from "./stores";
import TitanReactorMap from "./view-map";
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";
import { pxToMapMeter } from "../common/utils/conversions";


const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export default async (chkFilepath: string) => {
  if (getGame()?.isMap) {

    log.info(`loading map ${chkFilepath}`);
    const game = getGame();

    const chk = new Chk(await loadScm(chkFilepath));
    const terrainInfo = await loadTerrain(chk, pxToMapMeter(chk.size[0], chk.size[1]));

    game.scene.replaceTerrain(terrainInfo.terrain);

    updateWindowTitle(chk.title);
    return;
  }

  disposeGame();

  startLoadingProcess({
    id: "map",
    label: getFunString(),
    priority: 1,
  });

  initScreen({
    type: "map",
    filename: chkFilepath,
  } as MapScreen);

  log.verbose("loading chk");
  const chk = new Chk(await loadScm(chkFilepath));
  updateScreen({
    title: chk.title,
    description: chk.description,
  } as MapScreen);

  updateWindowTitle(chk.title);

  await waitForAssets();

  updateIndeterminateLoadingProcess("map", getFunString());

  log.verbose("initializing scene");
  const terrainInfo = await loadTerrain(chk, pxToMapMeter(chk.size[0], chk.size[1]));
  const scene = new Scene(terrainInfo);

  ImageHD.useDepth = false;
  updateIndeterminateLoadingProcess("map", getFunString());

  log.verbose("initializing gameloop");
  const game = await TitanReactorMap(
    chk,
    terrainInfo,
    scene
  );

  setGame(game);
  const logDiv = document.getElementById("log");
  if (logDiv) {
    logDiv.remove();
  }
  completeLoadingProcess("map");
  completeScreen();
};
