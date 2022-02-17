import loadScm from "./utils/load-scm";

import Chk from "bw-chk";
import {
  ImageHD,
} from "./core";
import * as log from "./ipc/log";
import { Scene } from "./render";
import loadTerrain from "./assets/load-terrain";
import gameStore from "./stores/game-store";
import processStore, { Process } from "./stores/process-store";
import screenStore, { ScreenType } from "./stores/screen-store";
import TitanReactorMap from "./view-map";
import getFunString from "./bootup/get-fun-string";
import waitForAssets from "./bootup/wait-for-assets";
import { pxToMapMeter } from "../common/utils/conversions";


const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export default async (chkFilepath: string) => {

  gameStore().disposeGame();

  processStore().init({
    id: Process.MapInitialization,
    label: getFunString(),
    priority: 1,
  });

  screenStore().init(ScreenType.Map);

  log.verbose("loading chk");
  const chk = new Chk(await loadScm(chkFilepath));
  screenStore().updateLoadingInformation({
    title: chk.title,
    description: chk.description,
  });

  updateWindowTitle(chk.title);

  await waitForAssets();

  processStore().updateIndeterminate(Process.MapInitialization, getFunString());

  log.verbose("initializing scene");
  const terrainInfo = await loadTerrain(chk, pxToMapMeter(chk.size[0], chk.size[1]));
  const scene = new Scene(terrainInfo);

  ImageHD.useDepth = false;
  processStore().updateIndeterminate(Process.MapInitialization, getFunString());

  log.verbose("initializing gameloop");
  const disposeGame = await TitanReactorMap(
    chk,
    terrainInfo,
    scene
  );

  gameStore().setDisposeGame(disposeGame);
  processStore().complete(Process.MapInitialization);
  screenStore().complete();
};
