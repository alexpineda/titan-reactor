import loadScm from "./utils/load-scm";

import Chk from "bw-chk";
import {
  ImageHD,
} from "./core";
import { log } from "./ipc";
import { Scene } from "./render";
import { generateTerrain } from "./assets/generate-terrain";
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

const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export default async (chkFilepath: string) => {
  if (getGame()?.isMap) {

    const game = getGame();

    const chk = new Chk(await loadScm(chkFilepath));
    const terrainInfo = await generateTerrain(chk);

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

  log("loading chk");
  const chk = new Chk(await loadScm(chkFilepath));
  updateScreen({
    title: chk.title,
    description: chk.description,
  } as MapScreen);

  updateWindowTitle(chk.title);

  await waitForAssets();

  log("initializing scene");
  updateIndeterminateLoadingProcess("map", getFunString());

  const terrainInfo = await generateTerrain(chk);
  const scene = new Scene(terrainInfo);

  ImageHD.useDepth = false;
  updateIndeterminateLoadingProcess("map", getFunString());

  const game = await TitanReactorMap(
    chk,
    terrainInfo,
    scene
  );

  setGame(game);
  completeLoadingProcess("map");
  completeScreen();
};
