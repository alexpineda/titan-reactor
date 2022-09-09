import Chk from "bw-chk";
import loadScm from "@utils/load-scm";
import * as log from "@ipc/log";
import { BaseScene } from "@render";
import {chkToTerrainMesh} from "@image/generate-map/chk-to-terrain-mesh";
import processStore, { Process } from "@stores/process-store";
import { Assets, UnitTileScale } from "common/types";
import { mapScene as mapScene } from "./map-scene";
import { waitForTruthy } from "@utils/wait-for-process";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { useWorldStore } from "@stores";
import gameStore from "@stores/game-store";
import Janitor from "@utils/janitor";
import { getOpenBW } from "@openbw";
import ChkDowngrader from "@process-replay/chk/chk-downgrader";
import {
  readCascFile,
} from "@utils/casclib";

const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export const mapSceneLoader = async (chkFilepath: string) => {
  processStore().start(Process.MapInitialization, 3);
  log.verbose("loading chk");

  const janitor = new Janitor;

  const chkBuffer = await loadScm(chkFilepath);
  const map = new Chk(chkBuffer);

  cleanMapTitles(map);
  updateWindowTitle(map.title);

  await waitForTruthy<Assets>(() => gameStore().assets);

  const openBw = await getOpenBW();
  await openBw.start(readCascFile);

  const chkDowngrader = new ChkDowngrader();
  openBw.loadMap(chkDowngrader.downgrade(chkBuffer));

  useWorldStore.setState({ map, mapImage: await createMapImage(map) });
  janitor.mop(() => useWorldStore.getState().reset())

  processStore().increment(Process.MapInitialization);

  log.verbose("initializing scene");

  const { terrain } = await chkToTerrainMesh(map, UnitTileScale.HD);
  const scene = new BaseScene(map.size[0], map.size[1], terrain);

  processStore().increment(Process.MapInitialization);

  const state = await mapScene(
    map,
    terrain,
    scene,
    janitor
  );

  processStore().complete(Process.MapInitialization);

  return state;
};
