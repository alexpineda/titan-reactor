import { Object3D } from "three";
import loadScm from "./utils/load-scm";

import Chk from "bw-chk";
import {
  createTitanImageFactory,
  TitanImageHD,
  TitanSprite,
} from "./core";
import { createIScriptRunnerFactory } from "../common/iscript";
import { ChkType } from "../common/types";
import { log } from "./ipc";
import { Scene } from "./render";
import { generateTerrain } from "./assets/generate-terrain";
import {
  disposeGame,
  getAssets,
  setGame,
  startLoadingProcess,
  updateIndeterminateLoadingProcess,
  completeLoadingProcess,
  initUIType,
  updateUIType,
  completeUIType,
  UITypeMap,
} from "./stores";
import TitanReactorMap from "./view-map";
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";

export default async (chkFilepath: string) => {
  const startTime = Date.now();
  const minDisplayTime = 3000;

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
  const chk = new Chk(await loadScm(chkFilepath)) as unknown as ChkType;
  updateUIType({
    title: chk.title,
    description: chk.description,
  } as UITypeMap);

  document.title = `Titan Reactor - ${chk.title}`;

  await waitForAssets();
  const assets = getAssets();
  if (!assets || !assets.bwDat) {
    throw new Error("assets not loaded");
  }

  log("initializing scene");
  updateIndeterminateLoadingProcess("map", getFunString());

  const terrainInfo = await generateTerrain(chk);
  const scene = new Scene(terrainInfo);

  const createTitanSprite = () => {
    if (!assets.bwDat) {
      throw new Error("assets not loaded");
    }
    return new TitanSprite(
      null,
      assets.bwDat,
      createTitanSprite,
      createTitanImageFactory(
        assets.bwDat,
        assets.grps,
        settings.spriteTextureResolution,
        createIScriptRunnerFactory(assets.bwDat, chk.tileset),
      ),
      (sprite: Object3D) => scene.add(sprite)
    );
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

  await new Promise((res) =>
    setTimeout(res, Math.max(0, minDisplayTime - (Date.now() - startTime)))
  );

  setGame(game);
  completeLoadingProcess("map");
  completeUIType();
};
