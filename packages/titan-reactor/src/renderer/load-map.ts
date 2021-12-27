import { Object3D } from "three";
import loadScm from "./utils/load-scm";

import Chk from "bw-chk";
import {
  createTitanImageFactory,
  TitanImageHD,
  TitanSprite,
} from "./core";
import { createIScriptRunnerFactory } from "../common/iscript";
import { log } from "./ipc";
import { Scene } from "./render";
import { generateTerrain } from "./assets/generate-terrain";
import {
  disposeGame,
  getAssets,
  getSettings,
  setGame,
  startLoadingProcess,
  updateIndeterminateLoadingProcess,
  completeLoadingProcess,
  initUIType,
  updateUIType,
  completeUIType,
  UITypeMap,
  getGame,
} from "./stores";
import TitanReactorMap from "./view-map";
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";

const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export default async (chkFilepath: string) => {
  const startTime = Date.now();
  const minDisplayTime = 3000;

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

  initUIType({
    type: "map",
    filename: chkFilepath,
  } as UITypeMap);

  log("loading chk");
  const chk = new Chk(await loadScm(chkFilepath));
  updateUIType({
    title: chk.title,
    description: chk.description,
  } as UITypeMap);

  updateWindowTitle(chk.title);

  await waitForAssets();
  const assets = getAssets();
  if (!assets) {
    throw new Error("assets not loaded");
  }

  log("initializing scene");
  updateIndeterminateLoadingProcess("map", getFunString());

  const settings = getSettings();
  const terrainInfo = await generateTerrain(chk);
  const scene = new Scene(terrainInfo);

  const createTitanSprite = () => {
    // if (!assets.bwDat) {
    //   throw new Error("assets not loaded");
    // }
    // return new TitanSprite(
    //   null,
    //   assets.bwDat,
    //   createTitanSprite,
    //   createTitanImageFactory(
    //     assets.bwDat,
    //     assets.grps,
    //     settings.spriteTextureResolution,
    //     createIScriptRunnerFactory(assets.bwDat, chk.tileset),
    //   ),
    //   (sprite: Object3D) => scene.add(sprite)
    // );
  };

  TitanImageHD.useDepth = false;
  updateIndeterminateLoadingProcess("map", getFunString());

  const game = await TitanReactorMap(
    assets.bwDat,
    chk.units,
    chk.sprites,
    terrainInfo,
    scene,
    createTitanSprite
  );

  setGame(game);
  completeLoadingProcess("map");
  completeUIType();
};
