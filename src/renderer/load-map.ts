import loadScm from "./utils/load-scm";

import Chk from "bw-chk";
import {
  ImageHD,
} from "./core";
import * as log from "./ipc/log";
import { Scene } from "./render";
import chkToTerrainMesh from "./image/generate-map/chk-to-terrain-mesh";
import gameStore from "@stores/game-store";
import processStore, { Process } from "@stores/process-store";
import screenStore from "@stores/screen-store";
import { AssetTextureResolution, ScreenType, UnitTileScale } from "common/types";
import TitanReactorMap from "./view-map";
import { waitForProcess } from "@utils/wait-for-process";
import { cleanMapTitles } from "@utils/chk-utils";
import { useWorldStore } from "@stores";
import settingsStore from "@stores/settings-store";


const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export default async (chkFilepath: string) => {

  const settings = settingsStore().data;

  gameStore().disposeGame();

  processStore().start(Process.MapInitialization, 3);

  screenStore().init(ScreenType.Map);

  log.verbose("loading chk");
  let chk: Chk;

  try {
    chk = new Chk(await loadScm(chkFilepath));
  } catch (e) {
    screenStore().setError(e instanceof Error ? e : new Error("Invalid chk"));
    return;
  }
  cleanMapTitles(chk);

  //FIXME: add janitor
  useWorldStore.setState({
    map: chk
  });

  updateWindowTitle(chk.title);

  await waitForProcess(Process.AtlasPreload);

  processStore().increment(Process.MapInitialization);

  log.verbose("initializing scene");
  const terrainInfo = await chkToTerrainMesh(chk, {
    textureResolution: settings.assets.terrain === AssetTextureResolution.SD ? UnitTileScale.SD : UnitTileScale.HD,
    anisotropy: settings.graphics.anisotropy,
    shadows: settings.graphics.terrainShadows
  });
  const scene = new Scene(terrainInfo);

  ImageHD.useDepth = false;
  processStore().increment(Process.MapInitialization);

  log.verbose("initializing gameloop");
  const disposeGame = await TitanReactorMap(
    chk,
    terrainInfo,
    scene
  );
  processStore().increment(Process.MapInitialization);

  gameStore().setDisposeGame(disposeGame);
  processStore().complete(Process.MapInitialization);
  screenStore().complete();
};
